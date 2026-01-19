from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AlertRead(BaseModel):
    id: int
    appointment_id: int
    type: str
    message: str
    severity: str
    resolved: bool
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class AlertUpdate(BaseModel):
    resolved: bool
