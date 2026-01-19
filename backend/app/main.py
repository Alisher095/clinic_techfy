from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.api.v1 import api_router
from app.core.config import settings
from app.core.scheduler import shutdown_scheduler, start_scheduler
from app.db.init_db import init_db
from app.db.session import async_session
from app.services.insurance import run_scheduled_checks

app = FastAPI(title=settings.project_name)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.frontend_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event() -> None:
    async with async_session() as session:
        await init_db(session)
        await run_scheduled_checks(session)
    start_scheduler()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    shutdown_scheduler()
