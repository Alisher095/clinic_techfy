from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


class InsuranceRecordDetail(BaseModel):
    provider: str
    status: str
    copay: Optional[float]
    last_checked: Optional[datetime]
    policy_id: Optional[str]


class AppointmentDetail(BaseModel):
    id: int
    scheduled_time: datetime
    verification_status: str
    copay: Optional[float]
    provider: Optional[str]


class PatientDetail(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr | None = None
    phone: str | None = None
    dob: Optional[datetime]
    appointments: List[AppointmentDetail]
    insurance_records: List[InsuranceRecordDetail]

    model_config = {
        "from_attributes": True,
    }


class PatientSummary(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr | None = None
    phone: str | None = None
    dob: Optional[datetime]
    created_at: datetime
    appointment_count: int

    model_config = {
        "from_attributes": True,
    }
