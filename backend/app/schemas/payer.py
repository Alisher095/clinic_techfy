from datetime import datetime
from pydantic import BaseModel


class PayerVerificationRequest(BaseModel):
    patient_name: str
    dob: datetime | None = None
    policy_id: str | None = None
    appointment_id: int | None = None


class PayerVerificationResponse(BaseModel):
    provider: str
    status: str
    plan_type: str
    copay: float | None
    deductible: float
    verified_at: datetime
    message: str