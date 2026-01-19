import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class VerificationStatus(str, enum.Enum):
    verified = "verified"
    needs_review = "needs_review"
    expired = "expired"


class AppointmentStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"


class AlertSeverity(str, enum.Enum):
    info = "info"
    warning = "warning"
    critical = "critical"


class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    timezone = Column(String(64), default="UTC")
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="clinic")
    patients = relationship("Patient", back_populates="clinic")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(256), unique=True, nullable=False, index=True)
    hashed_password = Column(String(512), nullable=False)
    role = Column(String(32), default="user")
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    clinic = relationship("Clinic", back_populates="users")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    first_name = Column(String(128), nullable=False)
    last_name = Column(String(128), nullable=False)
    dob = Column(DateTime, nullable=True)
    phone = Column(String(32), nullable=True)
    primary_provider = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    clinic = relationship("Clinic", back_populates="patients")
    appointments = relationship("Appointment", back_populates="patient")
    insurance_records = relationship("InsuranceRecord", back_populates="patient")
    account = relationship("PatientAccount", back_populates="patient", uselist=False)


class PatientAccount(Base):
    __tablename__ = "patient_accounts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, unique=True)
    email = Column(String(256), unique=True, nullable=False, index=True)
    hashed_password = Column(String(512), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="account")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.scheduled)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.needs_review)
    copay = Column(Float, nullable=True)
    provider = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", back_populates="appointments")
    alerts = relationship("Alert", back_populates="appointment")


class InsuranceRecord(Base):
    __tablename__ = "insurance_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    provider = Column(String(128), nullable=False)
    status = Column(Enum(VerificationStatus), default=VerificationStatus.needs_review)
    copay = Column(Float, nullable=True)
    last_checked = Column(DateTime, nullable=True)
    policy_id = Column(String(64), nullable=True)

    patient = relationship("Patient", back_populates="insurance_records")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    type = Column(String(64), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.info)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    appointment = relationship("Appointment", back_populates="alerts")


class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    status = Column(Enum(VerificationStatus), nullable=False)
    provider = Column(String(128), nullable=False)
    copay = Column(Float, nullable=True)
    last_checked = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    notifications = Column(Text, nullable=True)
    theme = Column(String(32), default="light")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
