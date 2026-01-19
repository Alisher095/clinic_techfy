from datetime import date, datetime

from pydantic import BaseModel, EmailStr


class PatientPortalRegister(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone: str | None = None
    dob: date | None = None


class PatientPortalLogin(BaseModel):
    email: EmailStr
    password: str


class PatientPortalToken(BaseModel):
    access_token: str


class PatientPortalProfile(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None

    model_config = {
        "from_attributes": True,
    }


class PatientAppointmentCreate(BaseModel):
    scheduled_time: datetime
    provider: str | None = None
