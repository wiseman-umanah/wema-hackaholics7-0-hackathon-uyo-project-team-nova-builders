"""
services/feed_simulator.py
--------------------------
Automatic multi-bank transaction feed simulator.

Runs as a background ``asyncio`` task alongside the polling loop.  Every
``FEED_APPEND_SECONDS`` seconds it appends 2–4 randomly generated realistic
Nigerian bank transactions (spread across multiple banks) to each connected
user's in-memory feed.

The polling loop cursor picks them up on the next cycle — the same code path
that real Mono / Okra data follows.  Every new transaction is pushed
immediately to the SSE stream as a ``new_transaction`` event so the frontend
sees a live, updating balance with no manual injection required.

Banks simulated
~~~~~~~~~~~~~~~
- Access Bank
- GTBank
- Zenith Bank
- First Bank
- UBA
- Wema Bank / ALAT

Environment variables
~~~~~~~~~~~~~~~~~~~~~
``FEED_APPEND_SECONDS``
    How often transactions are appended per user.  Default: ``5``.
"""

import asyncio
import logging
import os
import random
import uuid
from datetime import datetime, timezone

from data import store

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Bank registry
# ---------------------------------------------------------------------------

BANKS: list[dict] = [
    {"name": "Access Bank",  "code": "ACCESS", "color": "#f04e30"},
    {"name": "GTBank",       "code": "GTB",    "color": "#f07d00"},
    {"name": "Zenith Bank",  "code": "ZENITH", "color": "#002b6e"},
    {"name": "First Bank",   "code": "FBN",    "color": "#003087"},
    {"name": "UBA",          "code": "UBA",    "color": "#cc0000"},
    {"name": "Wema / ALAT",  "code": "WEMA",   "color": "#7c2d8e"},
]


# ---------------------------------------------------------------------------
# Transaction templates
# ---------------------------------------------------------------------------
# (category, status, description_template, (min_amount, max_amount), weight)
# Positive amount = credit, negative = debit.
# weight controls relative probability — higher = more frequent.

_POOL: list[tuple[str, str, str, tuple[int, int], int]] = [
    # ── Frequent normal debits ──────────────────────────────────────────────
    ("utilities",      "completed", "MTN Airtime Top-up",              (-500,    -2_000),  12),
    ("utilities",      "completed", "Glo Data Bundle",                 (-1_000,  -5_000),  10),
    ("utilities",      "completed", "DSTV Subscription",               (-5_000,  -10_000),  5),
    ("utilities",      "completed", "IKEDC Electricity",               (-5_000,  -20_000),  5),
    ("utilities",      "completed", "LagosWater Board",                (-2_000,   -8_000),  3),
    ("groceries",      "completed", "Shoprite - Groceries",            (-3_000,  -15_000),  8),
    ("groceries",      "completed", "Balogun Market",                  (-2_000,  -10_000),  6),
    ("groceries",      "completed", "Ebeano Supermarket",              (-4_000,  -20_000),  5),
    ("food",           "completed", "Chicken Republic",                (-2_000,   -6_000),  7),
    ("food",           "completed", "Domino's Pizza Lagos",            (-5_000,  -15_000),  4),
    ("food",           "completed", "Kilimanjaro Restaurant",          (-3_000,  -10_000),  5),
    ("transport",      "completed", "Bolt Rides",                      (-1_000,   -5_000),  8),
    ("transport",      "completed", "Uber Nigeria",                    (-1_500,   -8_000),  7),
    ("transport",      "completed", "Danfo Bus - Lagos BRT",           (-200,       -500),  10),
    ("health",         "completed", "Reddington Hospital",             (-10_000, -80_000),  2),
    ("health",         "completed", "MedPlus Pharmacy",                (-2_000,  -15_000),  4),
    ("education",      "completed", "Unilag School Fees",              (-50_000,-200_000),  1),
    ("education",      "completed", "Coursera Subscription",           (-10_000, -30_000),  2),
    ("transfer",       "completed", "Transfer Out - {name}",           (-5_000,  -40_000),  6),
    ("housing",        "completed", "Rent Payment - {name} Properties",(-50_000,-200_000),  2),

    # ── Loan repayments — normally fine ─────────────────────────────────────
    ("loan_repayment", "completed", "Loan Repayment - {bank}",         (-10_000, -60_000),  6),
    ("loan_repayment", "completed", "Mortgage Payment - {bank}",       (-30_000,-150_000),  2),

    # ── Income credits ───────────────────────────────────────────────────────
    ("income",         "completed", "Salary - {company}",              (100_000, 350_000),  8),
    ("income",         "completed", "Freelance - Paystack",            (20_000,   80_000),  5),
    ("income",         "completed", "Transfer In - {name}",            (5_000,    50_000),  7),
    ("income",         "completed", "Dividend Payment - Stanbic",      (10_000,   50_000),  2),
    ("income",         "completed", "Refund - {company}",              (2_000,    20_000),  3),

    # ── Trigger-causing events (low weight = rare but real) ─────────────────
    # bounced repayment → REPAYMENT_BOUNCE rule fires
    ("loan_repayment", "bounced",   "Loan Repayment - {bank} [FAILED]",(-10_000, -60_000),  2),
    # income missing → INCOME_DROP rule fires
    ("income_missing", "missing",   "Expected salary credit not found", (0, 0),              1),
]

_WEIGHTS = [t[4] for t in _POOL]

# Substitution values for description templates
_NAMES     = ["Emeka", "Chioma", "Tunde", "Ngozi", "Kemi", "Bola",
               "Adaeze", "Femi", "Yetunde", "Seun", "Amaka", "Chidi"]
_COMPANIES = ["Acme Ltd", "TechCorp Nigeria", "Dangote Group",
               "MTN Nigeria", "Flutterwave", "Andela", "Interswitch"]
_BANK_NAMES = [b["name"] for b in BANKS]


def _render(template: str) -> str:
    """Fill ``{name}``, ``{company}``, ``{bank}`` placeholders."""
    return (template
            .replace("{name}",    random.choice(_NAMES))
            .replace("{company}", random.choice(_COMPANIES))
            .replace("{bank}",    random.choice(_BANK_NAMES)))


def make_transaction(user_id: str, bank: dict | None = None) -> dict:
    """
    Generate one random realistic Nigerian bank transaction.

    Parameters
    ----------
    user_id : str
        Used to namespace the generated transaction ID.
    bank : dict | None
        Bank dict from ``BANKS``.  If ``None``, one is chosen at random.

    Returns
    -------
    dict
        A transaction dict compatible with the polling and trigger pipeline.
    """
    if bank is None:
        bank = random.choice(BANKS)

    category, status, desc_tpl, (amt_min, amt_max), _ = random.choices(
        _POOL, weights=_WEIGHTS, k=1
    )[0]

    description = _render(desc_tpl)

    # Credits positive, debits negative, missing event zero.
    # Negative ranges are stored as (max, min) e.g. (-500, -2000),
    # so normalise with min()/max() before calling randint.
    if amt_min == 0 and amt_max == 0:
        amount = 0
    else:
        lo, hi = min(amt_min, amt_max), max(amt_min, amt_max)
        amount = random.randint(lo, hi)

    return {
        "id":          f"sim_{user_id}_{uuid.uuid4().hex[:10]}",
        "date":        datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "time":        datetime.now(timezone.utc).strftime("%H:%M:%S"),
        "amount":      amount,
        "type":        "credit" if amount > 0 else ("debit" if amount < 0 else "event"),
        "description": description,
        "category":    category,
        "status":      status,
        "bank":        bank["name"],
        "bank_code":   bank["code"],
        "simulated":   True,
    }


# ---------------------------------------------------------------------------
# Background loop
# ---------------------------------------------------------------------------


async def feed_append_loop() -> None:
    """
    Continuously append simulated multi-bank transactions to each user's feed.

    Runs forever as a background ``asyncio`` task.  Each cycle appends 2–4
    transactions per user drawn from random banks.  The polling loop cursor
    picks them up within the next ``POLL_INTERVAL_SECONDS`` window and pushes
    them to the SSE stream as ``new_transaction`` events — so the frontend
    sees a live, updating balance every ~10 seconds with no manual input.

    Trigger-causing events (bounced repayments, missing income) appear
    probabilistically in the mix and will automatically fire the trigger
    engine and push a ``credential_state_change`` SSE event when they do.
    """
    interval: int = int(os.getenv("FEED_APPEND_SECONDS", "5"))
    logger.info(
        "Feed simulator starting — appending every %d seconds across %d banks.",
        interval, len(BANKS),
    )

    while True:
        await asyncio.sleep(interval)

        for user_id in store.connected_users():
            feed = store.get_feed(user_id)
            txns: list = feed.setdefault("transactions", [])

            # 2–4 transactions per cycle drawn from different banks
            count = random.choices([2, 3, 4], weights=[50, 35, 15])[0]
            banks_this_cycle = random.sample(BANKS, min(count, len(BANKS)))

            for i in range(count):
                bank = banks_this_cycle[i % len(banks_this_cycle)]
                txn = make_transaction(user_id, bank)
                txns.append(txn)

            store.set_feed(user_id, feed)

            logger.info(
                "Feed simulator: appended %d txn(s) for user %s "
                "(feed total: %d, cursor: %d).",
                count, user_id, len(txns), store.get_cursor(user_id),
            )
