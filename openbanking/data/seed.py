"""
data/seed.py
------------
Startup seed for the FOID Open Banking demo.

Loads ``mock_feed.json`` from disk and populates:
- The in-memory store (feeds, connected users, cursors).
- The database (User + Credential rows for the two demo personas).

This function is idempotent — safe to call on every server restart without
creating duplicate rows.
"""

import json
import logging
import os

from data import store

logger = logging.getLogger(__name__)

_FEED_PATH = os.path.join(os.path.dirname(__file__), "mock_feed.json")


async def seed_demo_personas() -> None:
    """
    Load mock transaction feeds and ensure demo personas exist in the database.

    Two personas are seeded:
    - ``ada_001`` — clean transaction history (all credentials active).
    - ``bode_001`` — has a bounced repayment later in the feed (will trigger
      a downgrade on the first poll cycle that reaches it).

    The cursor for each user is initialised to ``0`` so the poller processes
    all feed transactions from the start.

    Notes
    -----
    Database rows are created only if they do not already exist (idempotent).
    The in-memory store is always repopulated on startup regardless.
    """
    if not os.path.exists(_FEED_PATH):
        logger.warning("mock_feed.json not found at %s — skipping seed.", _FEED_PATH)
        return

    with open(_FEED_PATH, encoding="utf-8") as f:
        feed_data: dict = json.load(f)

    personas: list[dict] = feed_data.get("personas", [])
    if not personas:
        logger.warning("mock_feed.json has no 'personas' key — skipping seed.")
        return

    from db.base import AsyncSessionLocal
    from db.models import User, Credential, PollCursor
    from sqlalchemy import select
    import jwt
    import json as _json
    from datetime import datetime, timedelta, timezone
    from services.credential_issuer import _initial_claims, _sign_jwt

    async with AsyncSessionLocal() as db:
        for persona in personas:
            user_id: str = persona["id"]
            bvn: str = persona["bvn"]
            nin: str = persona["nin"]
            full_name: str = persona["full_name"]
            feed: dict = {"transactions": persona.get("transactions", [])}

            # Populate in-memory store regardless (fast path for poller + SSE)
            store.set_feed(user_id, feed)
            store.add_connected_user(user_id)

            # Check if user already exists in DB
            result = await db.execute(select(User).where(User.id == user_id))
            existing: User | None = result.scalar_one_or_none()

            if existing:
                # Re-mirror credential to in-memory store from DB
                cred_result = await db.execute(
                    select(Credential).where(Credential.user_id == user_id)
                )
                existing_cred: Credential | None = cred_result.scalar_one_or_none()
                if existing_cred:
                    store.save_credential(
                        user_id,
                        {
                            "persona_id": user_id,
                            "claims": _json.loads(existing_cred.claims_json),
                        },
                    )
                logger.debug("Persona %s already exists — skipping DB insert.", user_id)
                continue

            # Create User row with explicit ID (so mock IDs like "ada_001" work in demos)
            claims = _initial_claims()
            token = _sign_jwt(user_id, claims)

            user = User(id=user_id, bvn=bvn, nin=nin, full_name=full_name, is_connected=True)
            credential = Credential(user_id=user_id, token=token, claims_json=_json.dumps(claims))
            cursor_row = PollCursor(user_id=user_id, cursor=0)

            db.add(user)
            db.add(credential)
            db.add(cursor_row)

            store.save_credential(user_id, {"persona_id": user_id, "claims": claims})
            logger.info("Seeded demo persona: %s (%s).", user_id, full_name)

        await db.commit()

    logger.info("Seed complete — %d persona(s) loaded.", len(personas))
