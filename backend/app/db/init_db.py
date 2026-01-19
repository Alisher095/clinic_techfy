from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.base import Base
from app.db.models import Appointment, Clinic, InsuranceRecord, Patient, PatientAccount, User, VerificationStatus
from app.db.session import engine


async def init_db(session: AsyncSession) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    clinic = (await session.execute(select(Clinic))).scalars().first()
    if not clinic:
        clinic = Clinic(name="Demo Dental Group", timezone="UTC")
        session.add(clinic)
        await session.flush()

    super_admin = (await session.execute(select(User).filter_by(role="super_admin"))).scalars().first()
    if not super_admin:
        super_admin = User(
            email="admin@clinic.com",
            hashed_password=hash_password("admin123"),
            role="super_admin",
            clinic_id=clinic.id,
        )
        session.add(super_admin)

    demo_admin = (await session.execute(select(User).filter_by(email="demo@clinic.com"))).scalars().first()
    if not demo_admin:
        demo_admin = User(
            email="demo@clinic.com",
            hashed_password=hash_password("demo123"),
            role="super_admin",
            clinic_id=clinic.id,
        )
        session.add(demo_admin)

    existing_patient = (await session.execute(select(Patient))).scalars().first()
    if not existing_patient:
        patients = [
            Patient(clinic_id=clinic.id, first_name="Ava", last_name="Carter", phone="+1-555-0101"),
            Patient(clinic_id=clinic.id, first_name="Liam", last_name="Patel", phone="+1-555-0102"),
            Patient(clinic_id=clinic.id, first_name="Noah", last_name="Kim", phone="+1-555-0103"),
            Patient(clinic_id=clinic.id, first_name="Mia", last_name="Singh", phone="+1-555-0104"),
        ]
        session.add_all(patients)
        await session.flush()

        demo_patient_account = PatientAccount(
            patient_id=patients[0].id,
            email="ava.carter@patient.com",
            hashed_password=hash_password("patient123"),
        )
        session.add(demo_patient_account)

        now = datetime.utcnow()
        appointments = [
            Appointment(
                patient_id=patients[0].id,
                clinic_id=clinic.id,
                scheduled_time=now + timedelta(hours=6),
                provider="Blue Cross",
                verification_status=VerificationStatus.needs_review,
            ),
            Appointment(
                patient_id=patients[1].id,
                clinic_id=clinic.id,
                scheduled_time=now + timedelta(hours=18),
                provider="Aetna",
                verification_status=VerificationStatus.verified,
            ),
            Appointment(
                patient_id=patients[2].id,
                clinic_id=clinic.id,
                scheduled_time=now + timedelta(hours=30),
                provider="Cigna",
                verification_status=VerificationStatus.expired,
            ),
        ]
        session.add_all(appointments)

        insurance_records = [
            InsuranceRecord(
                patient_id=patients[0].id,
                provider="Blue Cross",
                status=VerificationStatus.needs_review,
                policy_id="POL-0001",
            ),
            InsuranceRecord(
                patient_id=patients[1].id,
                provider="Aetna",
                status=VerificationStatus.verified,
                copay=35.0,
                policy_id="POL-0002",
            ),
            InsuranceRecord(
                patient_id=patients[2].id,
                provider="Cigna",
                status=VerificationStatus.expired,
                policy_id="POL-0003",
            ),
        ]
        session.add_all(insurance_records)

    await session.commit()
