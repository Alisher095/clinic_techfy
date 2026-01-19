from fastapi import APIRouter

from app.api.v1 import alerts, appointments, auth, insurance, patient_portal, patients, ws

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(appointments.router)
api_router.include_router(patients.router)
api_router.include_router(insurance.router)
api_router.include_router(alerts.router)
api_router.include_router(ws.router)
api_router.include_router(patient_portal.router)
