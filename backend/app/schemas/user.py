from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserRead(BaseModel):
    id: int
    email: EmailStr
    role: str
    clinic_id: int
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }
