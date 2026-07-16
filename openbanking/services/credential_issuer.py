"""
services/credential_issuer.py
------------------------------
JWT credential issuance and state management.

Handles two operations:

``issue_identity_claims``
    Called by the KYC router after successful verification.  Creates the user
    row in the database and issues a signed JWT containing all five v1 claims
    at their initial states.

``update_state``
    Called by the trigger engine whenever a rule fires.  Mutates a single
    claim's state field, re-signs the JWT, persists the update, and triggers
    the user notification side-effect.

Credential format
~~~~~~~~~~~~~~~~~
JWTs are signed with HS256 using the ``JWT_SECRET`` environment variable.
The payload shape is::

    {
        "sub": "<user_id>",
        "claims": {
            "identity_verified": true,
            "bvn_validated": true,
            "age_over_18": true,
            "income_band":          {"value": "150k-300k", "state": "active"},
            "repayment_reliability": {"state": "active"}
        },
        "iat": <unix timestamp>,
        "exp": <unix timestamp + 30 days>
    }

Postgres migration note
~~~~~~~~~~~~~~~~~~~~~~~
``issue_identity_claims`` accepts an ``AsyncSession`` parameter so it works
with both SQLite (dev) and Postgres (prod) without code changes.
"""

import json
import logging
import os
from datetime import datetime, timedelta, timezone

import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from data import store

logger = logging.getLogger(__name__)

JWT_SECRET: str = os.getenv("JWT_SECRET", "foid-dev-secret-change-in-prod")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRY_DAYS: int = 30


# ---------------------------------------------------------------------------
# Initial issuance
# ---------------------------------------------------------------------------


async def issue_identity_claims(
    db: AsyncSession,
    bvn: str,
    nin: str,
    full_name: str,
) -> str:
    """
    Create a new persona and issue its initial signed JWT credential.

    If a user with the given BVN already exists, the existing persona ID is
    returned without creating a duplicate (idempotent).

    Parameters
    ----------
    db : AsyncSession
        Active database session (injected by the KYC router).
    bvn : str
        11-digit Bank Verification Number.
    nin : str
        11-digit National Identification Number.
    full_name : str
        User's full legal name.

    Returns
    -------
    str
        The persona UUID (``users.id``).
    """
    from db.models import User, Credential

    # Check for existing persona (idempotent)
    result = await db.execute(select(User).where(User.bvn == bvn))
    existing_user: User | None = result.scalar_one_or_none()

    if existing_user:
        logger.info("Persona already exists for BVN %s — returning %s.", bvn, existing_user.id)
        return existing_user.id

    # Build initial claims
    claims = _initial_claims()

    # Create user row
    user = User(bvn=bvn, nin=nin, full_name=full_name, is_connected=True)
    db.add(user)
    await db.flush()  # populate user.id before using it

    # Sign JWT
    token = _sign_jwt(user.id, claims)

    # Create credential row
    credential = Credential(
        user_id=user.id,
        token=token,
        claims_json=json.dumps(claims),
    )
    db.add(credential)
    await db.commit()

    # Mirror to in-memory store for the poller and SSE (fast reads, no DB query)
    store.add_connected_user(user.id)
    store.save_credential(user.id, {"persona_id": user.id, "claims": claims})

    logger.info("Credential issued for persona %s (%s).", user.id, full_name)
    return user.id


# ---------------------------------------------------------------------------
# State update
# ---------------------------------------------------------------------------


async def update_state(
    user_id: str,
    claim: str,
    new_state: str,
    reason: str,
) -> dict:
    """
    Mutate the state of a single claim and persist the updated credential.

    Steps
    -----
    1. Load the current credential from the in-memory store.
    2. Record the old state for the notification.
    3. Update ``claims[claim]["state"]`` to ``new_state``.
    4. Re-sign the JWT and update the database row.
    5. Persist updated claim snapshot to the in-memory store.
    6. Call the notifier (hard requirement — never skip this step).
    7. Push the event to all open SSE queues for this user.

    Parameters
    ----------
    user_id : str
        The persona UUID.
    claim : str
        The claim name to update (e.g. ``repayment_reliability``).
    new_state : str
        The new state value: ``active`` | ``under_review`` | ``downgraded`` | ``revoked``.
    reason : str
        Human-readable explanation shown to the user.

    Returns
    -------
    dict
        The updated credential dict (decoded claims snapshot).

    Raises
    ------
    ValueError
        If no credential exists for ``user_id`` or the claim is not found.
    """
    from services.notifier import notify
    from db.base import AsyncSessionLocal
    from db.models import Credential
    from sqlalchemy import update as sql_update

    cred = store.get_credential(user_id)
    if not cred:
        raise ValueError(f"No credential found for user_id='{user_id}'.")

    claims: dict = cred.get("claims", {})
    if claim not in claims:
        raise ValueError(f"Claim '{claim}' not found in credential for user_id='{user_id}'.")

    old_state: str = claims[claim].get("state", "unknown")

    if old_state == new_state:
        logger.debug(
            "State for claim '%s' on user %s is already '%s' — no update.",
            claim, user_id, new_state,
        )
        return cred

    # Mutate claim state
    claims[claim]["state"] = new_state

    # Re-sign JWT
    token = _sign_jwt(user_id, claims)

    # Persist to DB
    async with AsyncSessionLocal() as db:
        await db.execute(
            sql_update(Credential)
            .where(Credential.user_id == user_id)
            .values(token=token, claims_json=json.dumps(claims))
        )
        await db.commit()

    # Update in-memory store
    cred["claims"] = claims
    store.save_credential(user_id, cred)

    logger.info(
        "Credential updated for user %s: %s %s → %s.",
        user_id, claim, old_state, new_state,
    )

    # Notify user (hard requirement — never skip)
    await notify(user_id, claim, old_state, new_state, reason)

    return cred


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------


def _initial_claims() -> dict:
    """
    Return the initial claims payload for a newly issued credential.

    Identity claims are static (set once, never updated by the trigger engine).
    Financial trust claims start as ``active`` and update continuously.

    Returns
    -------
    dict
        Decoded claims dict matching the JWT payload schema.
    """
    return {
        "identity_verified": True,
        "bvn_validated": True,
        "age_over_18": True,
        "income_band": {"value": "150k-300k", "state": "active"},
        "repayment_reliability": {"state": "active"},
    }


def _sign_jwt(user_id: str, claims: dict) -> str:
    """
    Sign a JWT for the given user and claims payload.

    Parameters
    ----------
    user_id : str
        Subject (``sub``) for the JWT.
    claims : dict
        Decoded claims dict to embed in the payload.

    Returns
    -------
    str
        Signed JWT string (HS256).
    """
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "claims": claims,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=JWT_EXPIRY_DAYS)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
