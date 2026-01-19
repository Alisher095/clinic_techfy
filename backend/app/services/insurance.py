import hashlib
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.websocket import ws_manager
from app.db.models import (
    Alert,
    AlertSeverity,
    Appointment,
    InsuranceRecord,
    Patient,
    VerificationLog,
    VerificationStatus,
)
from app.schemas.insurance import SimulationResult


def deterministic_status(patient_id: int, appointment_id: int) -> VerificationStatus:
    key = f"{patient_id}-{appointment_id}"
    digest = int(hashlib.sha256(key.encode("utf-8")).hexdigest(), 16)
    return list(VerificationStatus)[digest % len(VerificationStatus)]


async def create_alert(
    session: AsyncSession,
    appointment: Appointment,
    status: VerificationStatus,
    manual: bool = False,
) -> Alert:
    severity = (
        AlertSeverity.critical
        if status is VerificationStatus.expired
        else AlertSeverity.warning
    )
    patient = await session.get(Patient, appointment.patient_id)

    message = (
        f"Insurance {status.value.replace('_', ' ')} for patient {patient.first_name} {patient.last_name}."
        if patient
        else f"Insurance {status.value.replace('_', ' ')} for appointment {appointment.id}."
    )
    if manual:
        message += " Manual re-check requested."

    alert = Alert(
        appointment_id=appointment.id,
        type="insurance",
        message=message,
        severity=severity,
        resolved=False,
    )
    session.add(alert)
    await session.flush()
    await ws_manager.broadcast(
        {
            "type": "alert",
            "payload": {
                "id": alert.id,
                "appointment_id": appointment.id,
                "severity": alert.severity.value,
                "message": alert.message,
                "created_at": alert.created_at.isoformat(),
            },
        }
    )
    return alert


async def log_verification(
    session: AsyncSession,
    appointment: Appointment,
    status: VerificationStatus,
    provider: str,
    copay: float | None,
) -> None:
    log = VerificationLog(
        patient_id=appointment.patient_id,
        appointment_id=appointment.id,
        status=status,
        provider=provider,
        copay=copay,
        last_checked=datetime.utcnow(),
        details=f"Verification executed via scheduler for appointment {appointment.id}.",
    )
    session.add(log)


async def run_insurance_check(
    session: AsyncSession,
    appointment: Appointment,
    provider_name: str,
    manual: bool = False,
) -> tuple[InsuranceRecord, VerificationStatus]:
    record_stmt = select(InsuranceRecord).filter_by(patient_id=appointment.patient_id)
    result = await session.execute(record_stmt)
    insurance_record = result.scalars().first()
    if not insurance_record:
        insurance_record = InsuranceRecord(
            patient_id=appointment.patient_id,
            provider=provider_name,
            status=VerificationStatus.needs_review,
            policy_id=f"POL-{appointment.patient_id:04}",
        )
        session.add(insurance_record)
        await session.flush()
    provider = insurance_record.provider or provider_name
    status = deterministic_status(appointment.patient_id, appointment.id)
    copay_value = round(20 + (appointment.patient_id % 4) * 7, 2) if status is VerificationStatus.verified else None

    insurance_record.status = status
    insurance_record.copay = copay_value
    insurance_record.last_checked = datetime.utcnow()

    appointment.verification_status = status
    appointment.copay = copay_value
    appointment.provider = provider

    await log_verification(session, appointment, status, provider, copay_value)

    if status is not VerificationStatus.verified:
        try:
            await create_alert(session, appointment, status, manual=manual)
        except Exception:
            pass

    return insurance_record, status


async def run_verification_simulation(
    session: AsyncSession,
    clinic_id: int,
    limit: int = 5,
) -> list[SimulationResult]:
    stmt = (
        select(Appointment)
        .where(Appointment.clinic_id == clinic_id)
        .order_by(Appointment.scheduled_time)
        .limit(limit)
        .options(selectinload(Appointment.patient))
    )
    results = await session.execute(stmt)
    appointments = results.scalars().unique().all()
    simulation_results: list[SimulationResult] = []
    for appointment in appointments:
        provider = appointment.provider or settings.provider_names[0]
        insurance_record, status = await run_insurance_check(
            session,
            appointment,
            provider_name=provider,
        )
        patient_name = "Unknown patient"
        if appointment.patient:
            patient_name = f"{appointment.patient.first_name} {appointment.patient.last_name}".strip()
        simulation_results.append(
            SimulationResult(
                appointment_id=appointment.id,
                patient=patient_name,
                status=status.value,
                provider=insurance_record.provider,
                copay=insurance_record.copay,
                last_checked=insurance_record.last_checked or datetime.utcnow(),
            )
        )
    await session.commit()
    return simulation_results


async def run_scheduled_checks(session: AsyncSession) -> None:
    window = datetime.utcnow() + timedelta(days=2)
    appointments_stmt = select(Appointment).where(
        Appointment.scheduled_time >= datetime.utcnow(),
        Appointment.scheduled_time <= window,
    )
    results = await session.execute(appointments_stmt)
    for appointment in results.scalars().unique().all():
        await run_insurance_check(session, appointment, provider_name=appointment.provider or "Blue Cross")
    await session.commit()
