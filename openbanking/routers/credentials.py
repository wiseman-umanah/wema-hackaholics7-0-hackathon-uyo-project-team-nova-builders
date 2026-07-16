"""
routers/credentials.py
-----------------------
Credential read and selective-disclosure endpoints.

Provides two routes:

``GET /api/credentials/{user_id}``
    Return the full decoded credential for a user (used by the user wallet UI).

``GET /api/credentials/{user_id}/verify``
    Return *only* the claims the user has consented to share with a specific
    relying party (used by the Wema loan product / RP view).
"""

import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class ClaimState(BaseModel):
    """State wrapper for a live (financial trust) claim."""

    value: str | None = Field(None, description="The claim value, if applicable.")
    state: str = Field(
        ...,
        description="Current state: ``active`` | ``under_review`` | ``downgraded`` | ``revoked``.",
    )


class CredentialClaims(BaseModel):
    """Full set of claims carried by a FOID credential."""

    identity_verified: bool = Field(..., description="True once identity verification passes.")
    bvn_validated: bool = Field(..., description="True once BVN is confirmed.")
    age_over_18: bool = Field(..., description="True if date-of-birth check passes.")
    income_band: ClaimState = Field(..., description="Living claim — auto-updates from transaction feed.")
    repayment_reliability: ClaimState = Field(..., description="Living claim — auto-updates from transaction feed.")


class CredentialResponse(BaseModel):
    """Full credential returned to the user wallet."""

    persona_id: str = Field(..., description="The user's FOID persona UUID.")
    claims: CredentialClaims
    issued_at: str = Field(..., description="ISO-8601 UTC timestamp of initial issuance.")
    updated_at: str = Field(..., description="ISO-8601 UTC timestamp of last state change.")


class RPCredentialResponse(BaseModel):
    """
    Selective-disclosure credential returned to a relying party.

    Only contains the claims the user explicitly approved on the consent screen.
    Raw financial data (transaction history, account numbers) is never exposed.
    """

    persona_id: str
    relying_party_id: str
    approved_claims: dict = Field(
        ...,
        description="Key-value map of only the claim names the user consented to share.",
    )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.get(
    "/{user_id}",
    response_model=CredentialResponse,
    summary="Get full credential (user wallet)",
    description="Return the complete decoded credential for a user. Used by the user wallet UI.",
)
async def get_credential(user_id: str) -> CredentialResponse:
    """
    Retrieve the full credential for a persona.

    Parameters
    ----------
    user_id : str
        The persona UUID.

    Returns
    -------
    CredentialResponse
        All five claims with their current states.

    Raises
    ------
    HTTPException (404)
        If no credential exists for the given ``user_id``.

    Notes
    -----
    Implemented in Phase 3 once credential issuance is wired.
    """
    # Phase 3: query db for credential, decode JWT, return full claims
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Implemented in Phase 3.",
    )


@router.get(
    "/{user_id}/verify",
    response_model=RPCredentialResponse,
    summary="Selective-disclosure credential check (relying party)",
    description=(
        "Return only the claims the user has consented to share with the "
        "specified relying party. Used by the Wema loan product dashboard."
    ),
)
async def verify_credential_for_rp(
    user_id: str,
    relying_party_id: str,
) -> RPCredentialResponse:
    """
    Return a selective-disclosure view of a user's credential.

    Only the claims listed in the user's consent record for ``relying_party_id``
    are included in the response.  Raw financial data is never returned.

    Parameters
    ----------
    user_id : str
        The persona UUID.
    relying_party_id : str
        Identifier of the relying party requesting verification
        (e.g. ``wema_loan_v1``).

    Returns
    -------
    RPCredentialResponse
        Subset of claims approved by the user.

    Raises
    ------
    HTTPException (404)
        If no credential or consent record exists.

    Notes
    -----
    Implemented in Phase 7 once consent recording is wired.
    """
    # Phase 7: check consent table, filter claims, return subset
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Implemented in Phase 7.",
    )
