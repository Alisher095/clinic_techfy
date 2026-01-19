from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.auth import get_current_user
from app.core.websocket import ws_manager
from app.db.models import Alert, Appointment, User
from app.db.session import get_session
from app.schemas.alert import AlertRead, AlertUpdate

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=List[AlertRead])
async def list_alerts(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> List[AlertRead]:
    stmt = (
        select(Alert)
        .join(Appointment)
        .filter(Appointment.clinic_id == user.clinic_id)
        .order_by(Alert.created_at.desc())
    )
    result = await session.execute(stmt)
    return result.scalars().all()


@router.patch("/{alert_id}", response_model=AlertRead)
async def resolve_alert(
    alert_id: int,
    payload: AlertUpdate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> AlertRead:
    alert = await session.get(Alert, alert_id)
    appointment = await session.get(Appointment, alert.appointment_id) if alert else None
    if not alert or not appointment or appointment.clinic_id != user.clinic_id:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.resolved = payload.resolved
    await session.commit()
    await ws_manager.broadcast({"type": "alert:update", "payload": {"id": alert.id, "resolved": alert.resolved}})
    return alert
