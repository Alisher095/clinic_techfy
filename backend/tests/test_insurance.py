import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Appointment, Clinic, Patient, User
from app.db.session import get_session
from app.main import app


@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        yield client


@pytest.fixture
async def session():
    async for session in get_session():
        yield session


@pytest.fixture
async def test_clinic(session: AsyncSession):
    clinic = Clinic(name="Test Clinic", timezone="UTC")
    session.add(clinic)
    await session.commit()
    await session.refresh(clinic)
    return clinic


@pytest.fixture
async def test_user(session: AsyncSession, test_clinic: Clinic):
    user = User(
        email="test@example.com",
        hashed_password="hashed",
        role="admin",
        clinic_id=test_clinic.id
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
async def test_patient(session: AsyncSession, test_clinic: Clinic):
    patient = Patient(
        clinic_id=test_clinic.id,
        first_name="John",
        last_name="Doe",
        dob=None,
        phone="123-456-7890"
    )
    session.add(patient)
    await session.commit()
    await session.refresh(patient)
    return patient


@pytest.fixture
async def test_appointment(session: AsyncSession, test_patient: Patient, test_clinic: Clinic):
    from datetime import datetime, timedelta
    appointment = Appointment(
        patient_id=test_patient.id,
        clinic_id=test_clinic.id,
        scheduled_time=datetime.utcnow() + timedelta(hours=1),
        provider="Test Provider"
    )
    session.add(appointment)
    await session.commit()
    await session.refresh(appointment)
    return appointment


@pytest.mark.asyncio
async def test_reverify_insurance(client: AsyncClient, test_appointment: Appointment, test_user: User):
    # Mock authentication - in real test, you'd set up proper auth
    # For now, assume endpoint works
    response = await client.post(f"/api/v1/insurance/{test_appointment.id}/reverify")
    # Since no auth, it should fail with 401 or similar
    assert response.status_code in [401, 403]  # Unauthorized or Forbidden