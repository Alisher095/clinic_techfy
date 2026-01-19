from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1.auth import get_current_user
from app.core.config import settings
from app.db.models import Appointment, User
from app.db.session import get_session
from app.schemas.insurance import ReverifyResponse
from app.schemas.insurance import (
    SimulationResponse,
)
from app.schemas.payer import PayerVerificationRequest, PayerVerificationResponse
from app.services.insurance import run_insurance_check
from app.services.insurance import run_verification_simulation
from app.services.payer import simulate_payer_lookup

router = APIRouter(prefix="/insurance", tags=["insurance"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/{appointment_id}/reverify", response_model=ReverifyResponse)
@limiter.limit("5/minute")
async def reverify_insurance(
    request: Request,
    appointment_id: int,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> ReverifyResponse:
    appointment = await session.get(Appointment, appointment_id)
    if not appointment or appointment.clinic_id != user.clinic_id:
        raise HTTPException(status_code=404, detail="Appointment not found")

    record, status = await run_insurance_check(
        session,
        appointment,
        provider_name=appointment.provider or settings.provider_names[0],
        manual=True,
    )
    await session.commit()

    return ReverifyResponse(
        appointment_id=appointment.id,
        status=status.value,
        provider=record.provider,
        copay=record.copay,
    )


@router.post("/payer/{payer_id}/verify", response_model=PayerVerificationResponse)
async def verify_payer(
    payer_id: str,
    payload: PayerVerificationRequest,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> PayerVerificationResponse:
    if payload.appointment_id:
        appointment = await session.get(Appointment, payload.appointment_id)
        if not appointment or appointment.clinic_id != user.clinic_id:
            raise HTTPException(status_code=404, detail="Appointment not found")

    result = simulate_payer_lookup(
        session=session,
        payer_id=payer_id,
        patient_name=payload.patient_name,
        policy_id=payload.policy_id,
        appointment_id=payload.appointment_id,
    )
    await session.commit()

    return PayerVerificationResponse(**result)


@router.post(
    "/simulation",
    response_model=SimulationResponse,
)
async def run_insurance_simulation(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> SimulationResponse:
    results = await run_verification_simulation(session, user.clinic_id)
    return SimulationResponse(results=results)
