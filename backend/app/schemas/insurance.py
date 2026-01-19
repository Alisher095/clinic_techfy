from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ReverifyResponse(BaseModel):
    appointment_id: int
    status: str
    provider: str
    copay: Optional[float]


class SimulationResult(BaseModel):
    appointment_id: int
    patient: str
    provider: str
    status: str
    copay: Optional[float]
    last_checked: datetime


class SimulationResponse(BaseModel):
    results: list[SimulationResult]
