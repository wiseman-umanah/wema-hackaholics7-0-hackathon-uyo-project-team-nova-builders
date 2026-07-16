"""
db/models.py
------------
SQLAlchemy ORM models for the FOID Open Banking polling service.

All models inherit from ``Base`` defined in ``db.base``.

Table design notes:
- ``users``            : every persona that has connected a bank account.
- ``credentials``      : one row per user; the current signed JWT + decoded claim
                         snapshot.  Updated in-place on each state change.
- ``transactions``     : raw feed records ingested by the poller.
- ``notifications``    : one row per state-change event pushed to a user.
- ``consents``         : which claims a user has approved for each relying party.
- ``poll_cursors``     : tracks the last-processed transaction index per user so
                         the poller never re-evaluates the same records.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base


def _now() -> datetime:
    """Return the current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def _uuid() -> str:
    """Generate a new random UUID string."""
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# User / Persona
# ---------------------------------------------------------------------------


class User(Base):
    """
    Represents a persona that has completed KYC and connected a bank account.

    Attributes
    ----------
    id :
        Primary key — UUID string.
    bvn :
        Bank Verification Number (mocked during hackathon).
    nin :
        National Identification Number (mocked during hackathon).
    full_name :
        Display name for the persona.
    is_connected :
        True while the user has an active Open Banking link.
    created_at :
        UTC timestamp of persona creation.
    """

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    bvn: Mapped[str] = mapped_column(String(11), unique=True, nullable=False)
    nin: Mapped[str] = mapped_column(String(11), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    is_connected: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )

    credential: Mapped["Credential"] = relationship(
        "Credential", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )
    consents: Mapped[list["Consent"]] = relationship(
        "Consent", back_populates="user", cascade="all, delete-orphan"
    )
    poll_cursor: Mapped["PollCursor"] = relationship(
        "PollCursor", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


# ---------------------------------------------------------------------------
# Credential
# ---------------------------------------------------------------------------


class Credential(Base):
    """
    Stores the current signed JWT and the decoded claim snapshot for a user.

    There is exactly one ``Credential`` row per user.  On every state change the
    ``token`` and ``claims_json`` columns are updated in-place — no history is
    kept in this table (the ``Notification`` table provides the audit trail).

    Attributes
    ----------
    id :
        Primary key — UUID string.
    user_id :
        Foreign key to ``users.id``.
    token :
        The current signed JWT (HS256).
    claims_json :
        JSON snapshot of the decoded claims dict for fast reads without
        decoding the JWT on every request.
    issued_at :
        UTC timestamp of first issuance.
    updated_at :
        UTC timestamp of the last state-change update.
    """

    __tablename__ = "credentials"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    token: Mapped[str] = mapped_column(Text, nullable=False)
    claims_json: Mapped[str] = mapped_column(Text, nullable=False)
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now, nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="credential")


# ---------------------------------------------------------------------------
# Transaction
# ---------------------------------------------------------------------------


class Transaction(Base):
    """
    A single bank transaction record ingested from the Open Banking feed.

    The poller writes new rows here as it advances the cursor.  The trigger
    engine reads from this table when evaluating rules.

    Attributes
    ----------
    id :
        Primary key — UUID string.
    user_id :
        Foreign key to ``users.id``.
    external_id :
        The transaction ID as returned by the bank / mock feed.  Used to
        prevent duplicate ingestion.
    txn_date :
        Date the transaction occurred (from the feed).
    amount :
        Positive = credit, negative = debit (NGN, stored as integer kobo).
    description :
        Merchant / payee description (e.g. "Salary - Acme Ltd").
    category :
        Normalised category: ``income`` | ``loan_repayment`` | ``utilities`` |
        ``transfer`` | ``other``.
    status :
        ``completed`` for normal transactions; ``bounced`` when a debit failed.
    ingested_at :
        UTC timestamp of when the poller wrote this row.
    """

    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    external_id: Mapped[str] = mapped_column(String(80), nullable=False)
    txn_date: Mapped[str] = mapped_column(String(10), nullable=False)  # ISO date YYYY-MM-DD
    amount: Mapped[int] = mapped_column(Integer, nullable=False)        # kobo
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(40), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="completed", nullable=False)
    ingested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )

    __table_args__ = (
        UniqueConstraint("user_id", "external_id", name="uq_user_external_txn"),
    )


# ---------------------------------------------------------------------------
# Notification
# ---------------------------------------------------------------------------


class Notification(Base):
    """
    One row per credential state-change event delivered to a user.

    This table is the audit trail for every automated change made by the
    trigger engine.  It is also the backing store for the in-app notification
    inbox shown in the user wallet UI.

    Attributes
    ----------
    id :
        Primary key — UUID string.
    user_id :
        Foreign key to ``users.id``.
    claim :
        The claim whose state changed (e.g. ``repayment_reliability``).
    old_state :
        The state before the change.
    new_state :
        The state after the change.
    reason :
        Human-readable explanation of why the change occurred.
    message :
        Full notification message shown to the user.
    is_read :
        False until the user dismisses the notification in the UI.
    created_at :
        UTC timestamp of state change.
    """

    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    claim: Mapped[str] = mapped_column(String(60), nullable=False)
    old_state: Mapped[str] = mapped_column(String(30), nullable=False)
    new_state: Mapped[str] = mapped_column(String(30), nullable=False)
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="notifications")


# ---------------------------------------------------------------------------
# Consent
# ---------------------------------------------------------------------------


class Consent(Base):
    """
    Records that a user has approved a relying party to read specific claims.

    One row per (user, relying_party) pair.  The approved claims are stored as
    a comma-separated string for simplicity; parse with ``claims_list`` property.

    Attributes
    ----------
    id :
        Primary key — UUID string.
    user_id :
        Foreign key to ``users.id``.
    relying_party_id :
        Identifier of the relying party (e.g. ``wema_loan_v1``).
    claims_csv :
        Comma-separated list of approved claim names.
    granted_at :
        UTC timestamp when the user tapped "Approve" on the consent screen.
    """

    __tablename__ = "consents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    relying_party_id: Mapped[str] = mapped_column(String(80), nullable=False)
    claims_csv: Mapped[str] = mapped_column(String(255), nullable=False)
    granted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )

    __table_args__ = (
        UniqueConstraint("user_id", "relying_party_id", name="uq_user_rp_consent"),
    )

    user: Mapped["User"] = relationship("User", back_populates="consents")

    @property
    def claims_list(self) -> list[str]:
        """Return the approved claims as a Python list."""
        return [c.strip() for c in self.claims_csv.split(",") if c.strip()]


# ---------------------------------------------------------------------------
# Poll Cursor
# ---------------------------------------------------------------------------


class PollCursor(Base):
    """
    Tracks the index of the last transaction the poller processed for a user.

    The poller slices ``transactions[cursor:]`` each cycle to obtain only new
    records.  On completion it writes ``cursor = len(transactions)`` back here.

    Attributes
    ----------
    id :
        Primary key — UUID string.
    user_id :
        Foreign key to ``users.id``.
    cursor :
        Zero-based index of the next unprocessed transaction in the feed.
    last_polled_at :
        UTC timestamp of the last completed poll cycle for this user.
    """

    __tablename__ = "poll_cursors"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    cursor: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_polled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="poll_cursor")
