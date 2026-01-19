from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str]
    exp: Optional[datetime]


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class SignupPayload(BaseModel):
    clinic_name: str
    full_name: Optional[str] = None
    email: EmailStr
    password: str
    role: Literal['staff', 'admin'] = 'staff'
