from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.db.models import Appointment, Clinic, InsuranceRecord, Patient, PatientAccount, VerificationStatus
from app.db.session import get_session
from app.schemas.appointment import AppointmentList, AppointmentRead, InsuranceSummary, PatientSummary
from app.schemas.patient_portal import (
    PatientPortalLogin,
    PatientPortalProfile,
    PatientPortalRegister,
    PatientPortalToken,
    PatientAppointmentCreate,
)

router = APIRouter(prefix="/patient", tags=["patient-portal"])
patient_oauth = OAuth2PasswordBearer(tokenUrl="/api/v1/patient/auth/login")


async def _get_patient_account(session: AsyncSession, email: str) -> PatientAccount | None:
    result = await session.execute(select(PatientAccount).filter_by(email=email))
    return result.scalars().first()


async def get_current_patient(
    token: str = Depends(patient_oauth),
    session: AsyncSession = Depends(get_session),
) -> PatientAccount:
    payload = decode_access_token(token)
    email = payload.get("sub")
    token_type = payload.get("typ")
    if token_type != "patient" or not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    account = await _get_patient_account(session, email)
    if not account:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Patient not found")
    return account


@router.post("/auth/register", response_model=PatientPortalProfile)
async def register_patient(
    payload: PatientPortalRegister,
    session: AsyncSession = Depends(get_session),
) -> PatientPortalProfile:
    existing = await _get_patient_account(session, payload.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    clinic = (await session.execute(select(Clinic))).scalars().first()
    if not clinic:
        raise HTTPException(status_code=400, detail="Clinic not available")

    dob_value = None
    if payload.dob:
        dob_value = datetime(payload.dob.year, payload.dob.month, payload.dob.day)

    patient = Patient(
        clinic_id=clinic.id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        dob=dob_value,
        phone=payload.phone,
    )
    session.add(patient)
    await session.flush()

    account = PatientAccount(
        patient_id=patient.id,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    session.add(account)
    await session.commit()

    return PatientPortalProfile(
        id=patient.id,
        first_name=patient.first_name,
        last_name=patient.last_name,
        email=account.email,
        phone=patient.phone,
    )


@router.post("/auth/login", response_model=PatientPortalToken)
async def login_patient(
    payload: PatientPortalLogin,
    session: AsyncSession = Depends(get_session),
) -> PatientPortalToken:
    account = await _get_patient_account(session, payload.email)
    if not account or not verify_password(payload.password, account.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    account.last_login = datetime.utcnow()
    await session.commit()

    token = create_access_token(
        subject=account.email,
        expires_delta=timedelta(minutes=60),
        token_type="patient",
    )
    return PatientPortalToken(access_token=token)


@router.get("/auth/me", response_model=PatientPortalProfile)
async def get_patient_profile(
    account: PatientAccount = Depends(get_current_patient),
    session: AsyncSession = Depends(get_session),
) -> PatientPortalProfile:
    patient = await session.get(Patient, account.patient_id)
    return PatientPortalProfile(
        id=patient.id if patient else 0,
        first_name=patient.first_name if patient else "",
        last_name=patient.last_name if patient else "",
        email=account.email,
        phone=patient.phone if patient else None,
    )


@router.get("/portal/appointments", response_model=AppointmentList)
async def get_patient_appointments(
    account: PatientAccount = Depends(get_current_patient),
    session: AsyncSession = Depends(get_session),
) -> AppointmentList:
    patient_id = account.patient_id
    patient = await session.get(Patient, patient_id)
    patient_summary = PatientSummary(
        id=patient.id if patient else 0,
        first_name=patient.first_name if patient else "",
        last_name=patient.last_name if patient else "",
    )
    record = (
        await session.execute(
            select(InsuranceRecord).filter_by(patient_id=patient_id)
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
    result = await session.execute(
        select(Appointment).where(Appointment.patient_id == patient_id).order_by(Appointment.scheduled_time)
    )
    appointments = result.scalars().all()
    return AppointmentList(
        appointments=[
            AppointmentRead(
                id=appointment.id,
                scheduled_time=appointment.scheduled_time,
                verification_status=appointment.verification_status.value,
                copay=appointment.copay,
                provider=appointment.provider,
                patient=patient_summary,
                insurance=insurance,
            )
            for appointment in appointments
        ],
        total=len(appointments),
    )


@router.post("/portal/appointments", response_model=AppointmentRead, status_code=201)
async def create_patient_appointment(
    payload: PatientAppointmentCreate,
    account: PatientAccount = Depends(get_current_patient),
    session: AsyncSession = Depends(get_session),
) -> AppointmentRead:
    patient = await session.get(Patient, account.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    appointment = Appointment(
        patient_id=patient.id,
        clinic_id=patient.clinic_id,
        scheduled_time=payload.scheduled_time,
        provider=payload.provider,
        verification_status=VerificationStatus.needs_review,
    )
    session.add(appointment)
    await session.commit()
    await session.refresh(appointment)

    record = (
        await session.execute(
            select(InsuranceRecord).filter_by(patient_id=patient.id)
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
