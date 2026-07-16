"""
routers/consent.py
------------------
Consent management endpoints.

Handles recording, reading, and revoking a user's approval for a relying
party to read specific credential claims.

Design principle: nothing is shared by default.  A relying party must present
a list of claim names; the user sees a consent screen showing exactly those
claims and explicitly approves or declines.
"""

import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class ConsentGrantRequest(BaseModel):
    """Payload sent when a user approves a relying party's claim request."""

    user_id: str = Field(..., description="The persona UUID of the approving user.")
    relying_party_id: str = Field(
        ...,
        description="Identifier of the relying party (e.g. ``wema_loan_v1``).",
        examples=["wema_loan_v1"],
    )
    claims: list[str] = Field(
        ...,
        min_length=1,
        description="List of claim names the user is approving.",
        examples=[["bvn_validated", "income_band"]],
    )


class ConsentGrantResponse(BaseModel):
    """Response returned after a consent is successfully recorded."""

    granted: bool = Field(..., description="Always ``true`` on success.")
    user_id: str
    relying_party_id: str
    claims: list[str] = Field(..., description="The claims that were approved.")


class ConsentRevokeRequest(BaseModel):
    """Payload sent when a user revokes a relying party's access."""

    user_id: str = Field(..., description="The persona UUID.")
    relying_party_id: str = Field(..., description="The relying party losing access.")


class ConsentRecord(BaseModel):
    """A single active consent record."""

    relying_party_id: str
    claims: list[str]
    granted_at: str = Field(..., description="ISO-8601 UTC timestamp.")


class ConsentListResponse(BaseModel):
    """All active consent records for a user."""

    user_id: str
    consents: list[ConsentRecord]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post(
    "/grant",
    response_model=ConsentGrantResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record user consent for a relying party",
    description=(
        "Persist the user's approval for a relying party to read specific "
        "credential claims. Called by the frontend after the user taps "
        "'Approve' on the consent screen."
    ),
)
async def grant_consent(payload: ConsentGrantRequest) -> ConsentGrantResponse:
    """
    Record that a user has approved a relying party to read specific claims.

    Parameters
    ----------
    payload : ConsentGrantRequest
        User ID, relying party ID, and the list of approved claim names.

    Returns
    -------
    ConsentGrantResponse
        Confirmation of what was approved.

    Notes
    -----
    Implemented in Phase 7.
    """
    # Phase 7: write consent row to DB
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Implemented in Phase 7.",
    )


@router.get(
    "/{user_id}",
    response_model=ConsentListResponse,
    summary="List all active consents for a user",
    description="Return every relying party the user has granted access to, and which claims.",
)
async def get_consents(user_id: str) -> ConsentListResponse:
    """
    Retrieve all active consent records for a given persona.

    Parameters
    ----------
    user_id : str
        The persona UUID.

    Returns
    -------
    ConsentListResponse
        List of active consents with relying party IDs and approved claims.

    Notes
    -----
    Implemented in Phase 7.
    """
    # Phase 7: query consent table
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Implemented in Phase 7.",
    )


@router.post(
    "/revoke",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke a relying party's access",
    description=(
        "Remove a relying party's consent record. "
        "After revocation the relying party's next credential check will fail. "
        "This must be visibly demoable — it is a stated design requirement."
    ),
)
async def revoke_consent(payload: ConsentRevokeRequest) -> None:
    """
    Revoke a relying party's access to a user's credential claims.

    Parameters
    ----------
    payload : ConsentRevokeRequest
        User ID and the relying party whose access is being removed.

    Notes
    -----
    Implemented in Phase 7.
    """
    # Phase 7: delete consent row from DB
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Implemented in Phase 7.",
    )
