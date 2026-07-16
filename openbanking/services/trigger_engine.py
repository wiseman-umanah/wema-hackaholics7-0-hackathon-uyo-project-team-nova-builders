"""
services/trigger_engine.py
---------------------------
Rule-based credential trigger evaluation.

Evaluates a list of transactions against a fixed set of deterministic rules
and fires credential state-change commands when a rule condition is met.

Design constraints (from PRD §5)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
- **No ML** — all rules are explicit thresholds and pattern checks.
  Deterministic behaviour is required for demo reliability and auditability.
- **No lending decisions** — the engine updates credential *state*, never
  computes a credit score or a loan recommendation.
- **Both directions** — rules cover upgrades (income restored) as well as
  downgrades (bounced repayment, income drop).

Rules (v1)
~~~~~~~~~~
``REPAYMENT_BOUNCE``
    A ``loan_repayment`` debit with ``status == "bounced"`` downgrades
    ``repayment_reliability`` from ``active`` → ``downgraded``.

``INCOME_DROP``
    A transaction with ``category == "income_missing"`` (injected synthetically
    or derived from an absent credit) downgrades ``income_band`` from
    ``active`` → ``under_review``.

``INCOME_RESTORED``
    A ``category == "income"`` credit when ``income_band.state == "under_review"``
    upgrades ``income_band`` back to ``active``.
"""

import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Public interface
# ---------------------------------------------------------------------------


async def evaluate(user_id: str, transactions: list[dict]) -> None:
    """
    Evaluate a batch of transactions against all trigger rules.

    Called by both the polling loop (on new feed records) and the demo
    control panel (on synthetic inject).  All rule checks are applied to
    every transaction in the batch; a single batch may trigger multiple rules.

    Parameters
    ----------
    user_id : str
        The persona UUID whose credential may be updated.
    transactions : list[dict]
        New transaction records to evaluate.  Each dict must have at minimum:
        ``category`` (str), ``status`` (str, optional).

    Notes
    -----
    ``credential_issuer.update_state`` is imported inside this function to
    avoid a circular import (credential_issuer → notifier → store, and
    ob_poller → trigger_engine → credential_issuer).

    Implemented fully in Phase 4.
    """
    from services.credential_issuer import update_state  # deferred — avoids circular import

    for txn in transactions:
        category: str = txn.get("category", "")
        txn_status: str = txn.get("status", "completed")
        txn_date: str = txn.get("date", str(datetime.now(timezone.utc).date()))

        # ── Rule: REPAYMENT_BOUNCE ─────────────────────────────────────────
        if category == "loan_repayment" and txn_status == "bounced":
            logger.info(
                "REPAYMENT_BOUNCE triggered for user %s (txn date: %s).",
                user_id, txn_date,
            )
            await update_state(
                user_id=user_id,
                claim="repayment_reliability",
                new_state="downgraded",
                reason=f"A loan repayment on your linked account bounced on {txn_date}.",
            )

        # ── Rule: INCOME_DROP ─────────────────────────────────────────────
        elif category == "income_missing":
            logger.info("INCOME_DROP triggered for user %s.", user_id)
            await update_state(
                user_id=user_id,
                claim="income_band",
                new_state="under_review",
                reason="No income credit was detected on your linked account this month.",
            )

        # ── Rule: INCOME_RESTORED ─────────────────────────────────────────
        elif category == "income":
            from data import store
            cred = store.get_credential(user_id)
            if cred:
                current_state = (
                    cred.get("claims", {})
                    .get("income_band", {})
                    .get("state", "active")
                )
                if current_state == "under_review":
                    logger.info("INCOME_RESTORED triggered for user %s.", user_id)
                    await update_state(
                        user_id=user_id,
                        claim="income_band",
                        new_state="active",
                        reason="Your income activity has resumed.",
                    )
