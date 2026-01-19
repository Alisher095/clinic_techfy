from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class PatientSummary(BaseModel):
    id: int
    first_name: str
    last_name: str


class InsuranceSummary(BaseModel):
    provider: str
    status: str
    copay: Optional[float]
    last_checked: Optional[datetime]


class AppointmentRead(BaseModel):
    id: int
    scheduled_time: datetime
    verification_status: str
    copay: Optional[float]
    provider: Optional[str]
    patient: PatientSummary
    insurance: Optional[InsuranceSummary]

    model_config = {
        "from_attributes": True,
    }


class AppointmentList(BaseModel):
    appointments: List[AppointmentRead]
    total: int


class AppointmentCreate(BaseModel):
    patient_id: int
    scheduled_time: datetime
    provider: Optional[str] = None
    copay: Optional[float] = None
    verification_status: Optional[str] = None
