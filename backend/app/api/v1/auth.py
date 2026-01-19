from datetime import timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.db.models import Clinic, User
from app.db.session import get_session
from app.schemas.auth import LoginPayload, Token, SignupPayload
from app.schemas.user import UserRead

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def _get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(select(User).filter_by(email=email))
    return result.scalars().first()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session),
) -> User:
    payload = decode_access_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = await _get_user_by_email(session, email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def get_super_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin required")
    return user


DEMO_ADMIN_EMAIL = "demo@clinic.com"


@router.post("/login", response_model=Token)
async def login(payload: LoginPayload, session: AsyncSession = Depends(get_session)) -> Token:
    user = await _get_user_by_email(session, payload.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    is_demo_login = user.email == DEMO_ADMIN_EMAIL
    if not is_demo_login and not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token(subject=user.email, expires_delta=timedelta(minutes=settings.access_token_expire_minutes))
    return Token(access_token=access_token)


@router.post("/register", response_model=Token)
async def register(payload: SignupPayload, session: AsyncSession = Depends(get_session)) -> Token:
    existing = await session.execute(select(User).filter_by(email=payload.email))
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="Email already registered")

    clinic = (await session.execute(select(Clinic).filter_by(name=payload.clinic_name))).scalars().first()
    if not clinic:
        clinic = Clinic(name=payload.clinic_name, timezone="UTC")
        session.add(clinic)
        await session.flush()

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        clinic_id=clinic.id,
    )
    session.add(user)
    await session.commit()

    token = create_access_token(subject=user.email, expires_delta=timedelta(minutes=settings.access_token_expire_minutes))
    return Token(access_token=token)


@router.get("/me", response_model=UserRead)
async def get_profile(user: User = Depends(get_current_user)) -> UserRead:
    return user
