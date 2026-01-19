import hashlib
import random
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import VerificationLog, VerificationStatus


def simulate_payer_lookup(
    session: AsyncSession,
    payer_id: str,
    patient_name: str,
    policy_id: str | None,
    appointment_id: int | None,
) -> dict:
    seed = f"{payer_id}:{patient_name}:{policy_id or 'unknown'}"
    digest = int(hashlib.sha256(seed.encode('utf-8')).hexdigest(), 16)
    random.seed(digest)

    statuses = list(VerificationStatus)
    status = statuses[digest % len(statuses)]
    plan_type = random.choice(['HMO', 'PPO', 'EPO', 'POS'])
    copay = round(25 + (digest % 150) / 1.0, 2) if status is VerificationStatus.verified else None
    deductible = round(500 + (digest % 1500) / 1.0, 2)
    message = (
        "Patient coverage verified and copay assigned."
        if copay is not None
        else f"Coverage requires manual review ({status.value.replace('_', ' ')})."
    )

    log = VerificationLog(
        patient_id=appointment_id or 0,
        appointment_id=appointment_id,
        status=status,
        provider=payer_id,
        copay=copay,
        last_checked=datetime.utcnow(),
        details=f"Payer simulator lookup for {patient_name}.",
    )
    session.add(log)

    return {
        "provider": payer_id.capitalize(),
        "status": status.value,
        "plan_type": plan_type,
        "copay": copay,
        "deductible": deductible,
        "verified_at": datetime.utcnow(),
        "message": message,
    }