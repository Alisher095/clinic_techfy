from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.auth import get_current_user
from app.db.models import Appointment, InsuranceRecord, Patient, PatientAccount, User
from app.db.session import get_session
from app.schemas.patient import AppointmentDetail, InsuranceRecordDetail, PatientDetail, PatientSummary

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/{patient_id}", response_model=PatientDetail)
async def get_patient(
    patient_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> PatientDetail:
    patient = await session.get(Patient, patient_id)
    if not patient or patient.clinic_id != user.clinic_id:
        raise HTTPException(status_code=404, detail="Patient not found")

    appointments = (
        await session.execute(select(Appointment).filter_by(patient_id=patient_id))
    ).scalars().all()
    insurance_records = (
        await session.execute(select(InsuranceRecord).filter_by(patient_id=patient_id))
    ).scalars().all()
    account = (
        await session.execute(select(PatientAccount).filter_by(patient_id=patient_id))
    ).scalars().first()

    return PatientDetail(
        id=patient.id,
        first_name=patient.first_name,
        last_name=patient.last_name,
        email=account.email if account else None,
        phone=patient.phone,
        dob=patient.dob,
        appointments=[
            AppointmentDetail(
                id=appointment.id,
                scheduled_time=appointment.scheduled_time,
                verification_status=appointment.verification_status.value,
                copay=appointment.copay,
                provider=appointment.provider,
            )
            for appointment in appointments
        ],
        insurance_records=[
            InsuranceRecordDetail(
                provider=record.provider,
                status=record.status.value,
                copay=record.copay,
                last_checked=record.last_checked,
                policy_id=record.policy_id,
            )
            for record in insurance_records
        ],
    )


@router.get("", response_model=List[PatientSummary])
async def list_patients(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> List[PatientSummary]:
    stmt = (
        select(Patient)
        .options(selectinload(Patient.appointments), selectinload(Patient.account))
        .filter_by(clinic_id=user.clinic_id)
        .order_by(Patient.created_at.desc())
    )
    patients = (await session.execute(stmt)).scalars().all()

    return [
        PatientSummary(
            id=patient.id,
            first_name=patient.first_name,
            last_name=patient.last_name,
            email=patient.account.email if patient.account else None,
            phone=patient.phone,
            dob=patient.dob,
            created_at=patient.created_at,
            appointment_count=len(patient.appointments or []),
        )
        for patient in patients
    ]
