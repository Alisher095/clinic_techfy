from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.db.models import Appointment, InsuranceRecord, Patient, User, VerificationStatus
from app.db.session import get_session
from app.schemas.appointment import AppointmentCreate, AppointmentList, AppointmentRead, InsuranceSummary, PatientSummary

router = APIRouter(prefix="/appointments", tags=["appointments"])


def _parse_timestamp(value: Optional[str], default: datetime) -> datetime:
    if not value:
        return default
    return datetime.fromisoformat(value)


def _normalize_status(value: Optional[str]) -> VerificationStatus:
    if not value:
        return VerificationStatus.needs_review
    lowered = value.strip().lower()
    if lowered in {"verified"}:
        return VerificationStatus.verified
    if lowered in {"needs_review", "needs review", "needs-review"}:
        return VerificationStatus.needs_review
    if lowered in {"expired"}:
        return VerificationStatus.expired
    return VerificationStatus.needs_review


@router.get("/", response_model=AppointmentList)
async def list_appointments(
    from_time: Optional[str] = None,
    to_time: Optional[str] = None,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> AppointmentList:
    start = _parse_timestamp(from_time, datetime.utcnow())
    end_default = start + timedelta(days=3)
    end = _parse_timestamp(to_time, end_default)
    stmt = select(Appointment).where(
        Appointment.clinic_id == user.clinic_id,
        Appointment.scheduled_time >= start,
        Appointment.scheduled_time <= end,
    )
    result = await session.execute(stmt)
    appointments = result.scalars().all()
    payload = []
    for appointment in appointments:
        patient = await session.get(Patient, appointment.patient_id)
        insurance = None
        record = (
            await session.execute(
                select(InsuranceRecord).filter_by(patient_id=appointment.patient_id)
            )
        ).scalars().first()
        if record:
            insurance = InsuranceSummary(
                provider=record.provider,
                status=record.status.value,
                copay=record.copay,
                last_checked=record.last_checked,
            )
        if patient:
            patient_summary = PatientSummary(
                id=patient.id,
                first_name=patient.first_name,
                last_name=patient.last_name,
            )
        else:
            patient_summary = PatientSummary(id=0, first_name="", last_name="")
        payload.append(
            AppointmentRead(
                id=appointment.id,
                scheduled_time=appointment.scheduled_time,
                verification_status=appointment.verification_status.value,
                copay=appointment.copay,
                provider=appointment.provider,
                patient=patient_summary,
                insurance=insurance,
            )
        )
    return AppointmentList(appointments=payload, total=len(payload))


@router.post("/", response_model=AppointmentRead, status_code=201)
async def create_appointment(
    payload: AppointmentCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> AppointmentRead:
    patient = await session.get(Patient, payload.patient_id)
    if not patient or patient.clinic_id != user.clinic_id:
        raise HTTPException(status_code=404, detail="Patient not found")

    appointment = Appointment(
        patient_id=payload.patient_id,
        clinic_id=user.clinic_id,
        scheduled_time=payload.scheduled_time,
        provider=payload.provider,
        copay=payload.copay,
        verification_status=_normalize_status(payload.verification_status),
    )
    session.add(appointment)
    await session.commit()
    await session.refresh(appointment)

    record = (
        await session.execute(
            select(InsuranceRecord).filter_by(patient_id=payload.patient_id)
        )
    ).scalars().first()
    insurance = None
    if record:
        insurance = InsuranceSummary(
            provider=record.provider,
            status=record.status.value,
            copay=record.copay,
            last_checked=record.last_checked,
        )
    patient_summary = PatientSummary(
        id=patient.id,
        first_name=patient.first_name,
        last_name=patient.last_name,
    )
    return AppointmentRead(
        id=appointment.id,
        scheduled_time=appointment.scheduled_time,
        verification_status=appointment.verification_status.value,
        copay=appointment.copay,
        provider=appointment.provider,
        patient=patient_summary,
        insurance=insurance,
    )
