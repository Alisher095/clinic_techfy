from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.db.session import async_session
from app.services.insurance import run_scheduled_checks

scheduler = AsyncIOScheduler()


def start_scheduler() -> None:
    if scheduler.running:
        return
    scheduler.add_job(run_checks_job, "interval", hours=24, next_run_time=None)
    scheduler.start()


def shutdown_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown()


async def run_checks_job() -> None:
    async with async_session() as session:
        await run_scheduled_checks(session)
