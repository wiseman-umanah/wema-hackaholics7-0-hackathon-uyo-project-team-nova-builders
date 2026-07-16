"""
services/ob_poller.py
---------------------
Open Banking polling service.

Runs a background ``asyncio`` loop that advances a cursor through each
connected user's transaction feed every ``POLL_INTERVAL_SECONDS`` seconds.
New transactions are passed to the trigger engine for evaluation.

Environment variables
~~~~~~~~~~~~~~~~~~~~~
``POLL_INTERVAL_SECONDS``
    How often to poll. Default: ``300`` (5 minutes).
    Set to ``10`` in ``.env`` during development.

The real Mono / Okra SDK is a drop-in replacement for ``_fetch_feed``.
Everything downstream (trigger engine, state machine, notifier) is identical.
"""

import asyncio
import logging
import os
from datetime import datetime, timezone

from data import store

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Feed fetching — swap this function to use the real Mono / Okra SDK
# ---------------------------------------------------------------------------


async def _fetch_feed(user_id: str) -> dict:
    """
    Fetch the transaction feed for a user.

    Currently reads from the in-memory mock store loaded at startup from
    ``data/mock_feed.json``.  To use the real Mono / Okra API, replace this
    function body only — the caller signature and return shape do not change.

    Parameters
    ----------
    user_id : str
        The persona UUID.

    Returns
    -------
    dict
        ``{"transactions": [...]}`` — same shape as ``mock_feed.json``.
    """
    return store.get_feed(user_id)


# ---------------------------------------------------------------------------
# Per-user poll
# ---------------------------------------------------------------------------


async def poll_user(user_id: str) -> None:
    """
    Advance the cursor for one user and evaluate any new transactions.

    Steps
    -----
    1. Fetch the current feed.
    2. Slice from the stored cursor to the end to get unprocessed transactions.
    3. If there are new transactions, pass them to the trigger engine.
    4. Update the cursor to mark them as processed.

    Parameters
    ----------
    user_id : str
        The persona UUID to poll.
    """
    from services.trigger_engine import evaluate  # deferred to avoid circular import
    import json

    feed = await _fetch_feed(user_id)
    transactions: list[dict] = feed.get("transactions", [])
    cursor: int = store.get_cursor(user_id)
    new_txns: list[dict] = transactions[cursor:]

    if not new_txns:
        logger.debug("No new transactions for user %s (cursor=%d).", user_id, cursor)
        return

    logger.info(
        "Polling user %s: %d new transaction(s) found (cursor %d → %d).",
        user_id, len(new_txns), cursor, len(transactions),
    )

    # ── Push every new transaction to the SSE stream immediately ──────────
    # This is the "live feed" event — the frontend sees every transaction
    # as it arrives, not just state-change events.
    running_balance = feed.get("balance", 0)
    for txn in new_txns:
        running_balance += txn.get("amount", 0)
        sse_event = {
            "type":        "new_transaction",
            "user_id":     user_id,
            "transaction": txn,
            "balance":     running_balance,
            "bank":        txn.get("bank", "Open Banking"),
            "bank_code":   txn.get("bank_code", "OB"),
            "timestamp":   datetime.now(timezone.utc).isoformat(),
        }
        queues = store.sse_subscribers.get(user_id, [])
        for q in queues:
            await q.put(sse_event)

    # Persist updated balance
    feed["balance"] = running_balance
    store.set_feed(user_id, feed)

    # ── Evaluate trigger rules on the new batch ────────────────────────────
    await evaluate(user_id, new_txns)
    store.save_cursor(user_id, len(transactions))


# ---------------------------------------------------------------------------
# Polling loop
# ---------------------------------------------------------------------------


async def polling_loop() -> None:
    """
    Continuously poll all connected users on a fixed interval.

    Runs forever as an ``asyncio`` background task started in ``main.lifespan``.
    Cancelled cleanly on application shutdown.

    The interval is read from the ``POLL_INTERVAL_SECONDS`` environment
    variable so development builds can use a shorter cycle without code changes.
    """
    interval: int = int(os.getenv("POLL_INTERVAL_SECONDS", "300"))
    logger.info("Open Banking poller starting — interval: %d seconds.", interval)

    while True:
        users = store.connected_users()
        logger.debug("Poll cycle starting for %d connected user(s).", len(users))

        for user_id in users:
            try:
                await poll_user(user_id)
            except Exception:
                # Never let one user's error kill the whole polling loop
                logger.exception("Error polling user %s — skipping.", user_id)

        store.save_last_poll(datetime.now(timezone.utc))
        await asyncio.sleep(interval)


# ---------------------------------------------------------------------------
# Demo bypass
# ---------------------------------------------------------------------------


async def inject_event(user_id: str, event_type: str) -> None:
    """
    Inject a synthetic trigger event directly into the trigger engine.

    Bypasses the poll timer entirely — used by the demo control panel to
    produce an instant on-stage state change without waiting for the next
    poll cycle.

    Parameters
    ----------
    user_id : str
        The persona UUID to inject the event for.
    event_type : str
        One of ``missed_repayment``, ``income_drop``, ``income_restored``.

    Raises
    ------
    ValueError
        If ``event_type`` is not a recognised synthetic event type.
    """
    from services.trigger_engine import evaluate  # deferred to avoid circular import

    _SYNTHETIC_EVENTS: dict[str, dict] = {
        "missed_repayment": {
            "id": "synthetic_missed_repayment",
            "date": str(datetime.now(timezone.utc).date()),
            "amount": -25000,
            "description": "Loan Repayment - Access Bank [SYNTHETIC]",
            "category": "loan_repayment",
            "status": "bounced",
            "synthetic": True,
        },
        "income_drop": {
            "id": "synthetic_income_drop",
            "date": str(datetime.now(timezone.utc).date()),
            "amount": 0,
            "description": "Expected income credit missing [SYNTHETIC]",
            "category": "income_missing",
            "status": "missing",
            "synthetic": True,
        },
        "income_restored": {
            "id": "synthetic_income_restored",
            "date": str(datetime.now(timezone.utc).date()),
            "amount": 150000,
            "description": "Salary - Acme Ltd [SYNTHETIC]",
            "category": "income",
            "status": "completed",
            "synthetic": True,
        },
    }

    if event_type not in _SYNTHETIC_EVENTS:
        raise ValueError(
            f"Unknown event_type '{event_type}'. "
            f"Valid options: {list(_SYNTHETIC_EVENTS.keys())}"
        )

    synthetic_txn = _SYNTHETIC_EVENTS[event_type]
    logger.info(
        "Demo inject: firing synthetic '%s' event for user %s.",
        event_type, user_id,
    )
    await evaluate(user_id, [synthetic_txn])
