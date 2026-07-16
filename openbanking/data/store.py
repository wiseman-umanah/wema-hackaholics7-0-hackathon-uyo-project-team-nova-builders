"""
data/store.py
-------------
In-memory state store.

Provides fast, synchronous access to runtime state for the polling loop,
trigger engine, SSE push, and credential reads.

This is the single source of truth for state that changes frequently
(poll cursors, SSE subscriber queues, notification buffers).  The database
(``db/models.py``) is the durable source of truth for persisted state
(credentials, users, consents, notification history).

Postgres migration note
~~~~~~~~~~~~~~~~~~~~~~~
On startup, ``data/seed.py`` loads ``mock_feed.json`` and pre-populates this
store.  In production the feed data comes from the live Mono / Okra API —
the store methods are the same; only the feed source changes.
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Internal state
# ---------------------------------------------------------------------------

_feeds: dict[str, dict] = {}          # user_id → transaction feed dict
_cursors: dict[str, int] = {}         # user_id → last processed txn index
_connected: list[str] = []            # user IDs with an active bank link

_credentials: dict[str, dict] = {}    # user_id → decoded credential dict
_notifications: dict[str, list] = {}  # user_id → list of notification dicts

_last_poll: datetime | None = None    # timestamp of last completed poll cycle

# SSE: one asyncio.Queue per open browser tab, keyed by user_id
sse_subscribers: dict[str, list[asyncio.Queue]] = {}

_consents: dict[str, dict[str, list[str]]] = {}  # user_id → {rp_id → [claims]}


# ---------------------------------------------------------------------------
# Connected users
# ---------------------------------------------------------------------------


def connected_users() -> list[str]:
    """
    Return the list of user IDs with an active Open Banking connection.

    Returns
    -------
    list[str]
        Snapshot of the connected user list.
    """
    return list(_connected)


def add_connected_user(user_id: str) -> None:
    """
    Mark a user as having an active Open Banking connection.

    Idempotent — safe to call multiple times for the same user.

    Parameters
    ----------
    user_id : str
        The persona UUID.
    """
    if user_id not in _connected:
        _connected.append(user_id)
        logger.debug("User %s added to connected users.", user_id)


def remove_connected_user(user_id: str) -> None:
    """
    Remove a user from the active connection list (e.g. on account disconnect).

    Parameters
    ----------
    user_id : str
        The persona UUID.
    """
    if user_id in _connected:
        _connected.remove(user_id)
        logger.debug("User %s removed from connected users.", user_id)


# ---------------------------------------------------------------------------
# Transaction feed
# ---------------------------------------------------------------------------


def get_feed(user_id: str) -> dict:
    """
    Return the transaction feed for a user.

    Parameters
    ----------
    user_id : str
        The persona UUID.

    Returns
    -------
    dict
        ``{"transactions": [...]}`` or an empty feed if not found.
    """
    return _feeds.get(user_id, {"transactions": []})


def set_feed(user_id: str, feed: dict) -> None:
    """
    Store a transaction feed for a user.

    Called at startup by ``data/seed.py`` when loading ``mock_feed.json``.

    Parameters
    ----------
    user_id : str
        The persona UUID.
    feed : dict
        ``{"transactions": [...]}``
    """
    _feeds[user_id] = feed


# ---------------------------------------------------------------------------
# Poll cursor
# ---------------------------------------------------------------------------


def get_cursor(user_id: str) -> int:
    """
    Return the index of the next unprocessed transaction for a user.

    Parameters
    ----------
    user_id : str
        The persona UUID.

    Returns
    -------
    int
        Zero-based index.  ``0`` if the user has never been polled.
    """
    return _cursors.get(user_id, 0)


def save_cursor(user_id: str, idx: int) -> None:
    """
    Persist the cursor after a completed poll cycle.

    Parameters
    ----------
    user_id : str
        The persona UUID.
    idx : int
        The new cursor value (typically ``len(feed["transactions"])``).
    """
    _cursors[user_id] = idx


def save_last_poll(ts: datetime) -> None:
    """
    Record the timestamp of the most recently completed poll cycle.

    Parameters
    ----------
    ts : datetime
        UTC timestamp.
    """
    global _last_poll
    _last_poll = ts


def get_last_poll() -> datetime | None:
    """
    Return the UTC timestamp of the last completed poll cycle, or ``None``.

    Returns
    -------
    datetime | None
    """
    return _last_poll


# ---------------------------------------------------------------------------
# Credentials
# ---------------------------------------------------------------------------


def get_credential(user_id: str) -> dict | None:
    """
    Return the decoded credential dict for a user, or ``None`` if not found.

    Parameters
    ----------
    user_id : str
        The persona UUID.

    Returns
    -------
    dict | None
    """
    return _credentials.get(user_id)


def save_credential(user_id: str, cred: dict) -> None:
    """
    Update the in-memory credential snapshot for a user.

    Called by ``credential_issuer`` after issuance and after each state change.

    Parameters
    ----------
    user_id : str
        The persona UUID.
    cred : dict
        Decoded credential dict (not raw JWT).
    """
    _credentials[user_id] = cred


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------


def get_notifications(user_id: str) -> list[dict]:
    """
    Return all notifications for a user.

    Parameters
    ----------
    user_id : str
        The persona UUID.

    Returns
    -------
    list[dict]
        List of notification dicts, oldest first.
    """
    return _notifications.get(user_id, [])


def push_notification(user_id: str, notif: dict) -> None:
    """
    Append a notification to the user's in-memory inbox.

    Parameters
    ----------
    user_id : str
        The persona UUID.
    notif : dict
        Notification payload dict.
    """
    _notifications.setdefault(user_id, []).append(notif)


# ---------------------------------------------------------------------------
# Consents
# ---------------------------------------------------------------------------


def save_consent(user_id: str, relying_party_id: str, claims: list[str]) -> None:
    """
    Record that a user has approved a relying party to read specific claims.

    Parameters
    ----------
    user_id : str
        The persona UUID.
    relying_party_id : str
        Identifier of the relying party.
    claims : list[str]
        List of approved claim names.
    """
    _consents.setdefault(user_id, {})[relying_party_id] = claims


def get_consent(user_id: str, relying_party_id: str) -> list[str] | None:
    """
    Return the approved claims for a (user, relying party) pair.

    Parameters
    ----------
    user_id : str
        The persona UUID.
    relying_party_id : str
        The relying party identifier.

    Returns
    -------
    list[str] | None
        List of approved claim names, or ``None`` if no consent exists.
    """
    return _consents.get(user_id, {}).get(relying_party_id)


def get_all_consents(user_id: str) -> dict[str, list[str]]:
    """
    Return all consent records for a user as a dict.

    Parameters
    ----------
    user_id : str
        The persona UUID.

    Returns
    -------
    dict[str, list[str]]
        ``{relying_party_id: [claim, ...]}``
    """
    return _consents.get(user_id, {})


def revoke_consent(user_id: str, relying_party_id: str) -> None:
    """
    Remove a relying party's consent record for a user.

    Parameters
    ----------
    user_id : str
        The persona UUID.
    relying_party_id : str
        The relying party losing access.
    """
    _consents.get(user_id, {}).pop(relying_party_id, None)
