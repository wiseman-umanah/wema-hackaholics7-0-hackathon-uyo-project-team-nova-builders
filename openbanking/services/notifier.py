"""
services/notifier.py
--------------------
User notification service.

Fires on every credential state change.  This is a **hard requirement**, not
optional UX — a silent state downgrade would make FOID look like invisible
surveillance rather than transparent, user-controlled infrastructure (PRD §5).

Each notification records:
- Which claim changed.
- The old and new states.
- A plain-English reason the user can understand.
- A full message suitable for display in the wallet UI.

Notifications are persisted to the database **and** pushed synchronously to
all open SSE queues for the affected user.
"""

import asyncio
import json
import logging
from datetime import datetime, timezone

from data import store

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Notification messages
# ---------------------------------------------------------------------------

_MESSAGES: dict[tuple[str, str], str] = {
    ("repayment_reliability", "downgraded"): (
        "A loan repayment on your linked account was missed or bounced. "
        "Your repayment reliability credential has been updated. "
        "If this is incorrect, you can raise a dispute through your bank."
    ),
    ("repayment_reliability", "revoked"): (
        "Multiple missed repayments have been detected on your linked account. "
        "Your repayment reliability credential has been revoked. "
        "Contact your bank to resolve outstanding obligations."
    ),
    ("income_band", "under_review"): (
        "No income credit was detected on your linked account this month. "
        "Your income band credential is now under review. "
        "It will be restored automatically once income activity resumes."
    ),
    ("income_band", "active"): (
        "Your income activity has resumed. "
        "Your income band credential has been restored to active."
    ),
    ("income_band", "downgraded"): (
        "A sustained drop in your account income has been detected. "
        "Your income band credential has been downgraded."
    ),
}

_DEFAULT_MESSAGE = (
    "Your {claim} credential has changed from {old_state} to {new_state}. "
    "Reason: {reason}"
)


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------


async def notify(
    user_id: str,
    claim: str,
    old_state: str,
    new_state: str,
    reason: str,
) -> None:
    """
    Persist a notification and push it to all open SSE streams for the user.

    Parameters
    ----------
    user_id : str
        The persona UUID of the affected user.
    claim : str
        The credential claim that changed (e.g. ``repayment_reliability``).
    old_state : str
        The state before the change.
    new_state : str
        The state after the change.
    reason : str
        Technical reason from the trigger engine (stored in DB).

    Notes
    -----
    This function must be called for **every** state change.  Skipping it
    violates the transparency requirement stated in PRD §5 and FAQ Q29.
    """
    message = _MESSAGES.get(
        (claim, new_state),
        _DEFAULT_MESSAGE.format(
            claim=claim, old_state=old_state, new_state=new_state, reason=reason
        ),
    )

    notification: dict = {
        "type": "credential_state_change",
        "user_id": user_id,
        "claim": claim,
        "old_state": old_state,
        "new_state": new_state,
        "reason": reason,
        "message": message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    # 1. Persist to in-memory store
    store.push_notification(user_id, notification)

    # 2. Persist to database (Phase 5 — write Notification row)
    await _persist_to_db(user_id, claim, old_state, new_state, reason, message)

    # 3. Push to all active SSE queues for this user
    await _push_to_sse(user_id, notification)

    logger.info(
        "Notification sent to user %s: %s %s → %s.",
        user_id, claim, old_state, new_state,
    )


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------


async def _persist_to_db(
    user_id: str,
    claim: str,
    old_state: str,
    new_state: str,
    reason: str,
    message: str,
) -> None:
    """
    Write a ``Notification`` row to the database.

    Parameters
    ----------
    (see ``notify`` docstring for parameter descriptions)
    message : str
        Full notification message already resolved from ``_MESSAGES``.
    """
    from db.base import AsyncSessionLocal
    from db.models import Notification

    async with AsyncSessionLocal() as db:
        row = Notification(
            user_id=user_id,
            claim=claim,
            old_state=old_state,
            new_state=new_state,
            reason=reason,
            message=message,
        )
        db.add(row)
        await db.commit()


async def _push_to_sse(user_id: str, event: dict) -> None:
    """
    Put the event onto every open SSE queue registered for this user.

    Parameters
    ----------
    user_id : str
        The persona UUID.
    event : dict
        The notification payload to push.
    """
    queues: list[asyncio.Queue] = store.sse_subscribers.get(user_id, [])
    for queue in queues:
        await queue.put(event)

    if queues:
        logger.debug("SSE event pushed to %d subscriber(s) for user %s.", len(queues), user_id)
