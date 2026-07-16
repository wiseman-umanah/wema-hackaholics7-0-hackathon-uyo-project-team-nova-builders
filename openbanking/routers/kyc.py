"""
routers/kyc.py
--------------
KYC verification router.

Provides a single mock endpoint that simulates an NIMC/BVN/NIN identity
verification check.  The check always succeeds in the hackathon build and
returns after a brief artificial delay to mimic real-world API latency.

In a production deployment this router would delegate to a licensed KYC
provider (e.g. Smile Identity, VerifyMe) and the NIMC national identity
infrastructure.  The request/response schema is designed to be identical so
the switch requires only a service-layer change, not a schema change.
"""

import asyncio
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from db.base import AsyncSessionLocal

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# Dependency
# ---------------------------------------------------------------------------


async def get_db() -> AsyncSession:  # type: ignore[return]
    """
    Yield an async database session and close it when the request is done.

    Used as a FastAPI dependency via ``Depends(get_db)``.
    """
    async with AsyncSessionLocal() as session:
        yield session


DbDep = Annotated[AsyncSession, Depends(get_db)]


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class KYCRequest(BaseModel):
    """Payload sent by the frontend to initiate identity verification."""

    bvn: str = Field(
        ...,
        min_length=11,
        max_length=11,
        pattern=r"^\d{11}$",
        description="11-digit Bank Verification Number.",
        examples=["12345678901"],
    )
    nin: str = Field(
        ...,
        min_length=11,
        max_length=11,
        pattern=r"^\d{11}$",
        description="11-digit National Identification Number.",
        examples=["98765432100"],
    )
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=120,
        description="Full legal name as it appears on government ID.",
        examples=["Ada Okonkwo"],
    )
    selfie_b64: str = Field(
        ...,
        description=(
            "Base64-encoded selfie image used for liveness detection. "
            "Ignored by the mock — accepted to keep the schema production-ready."
        ),
    )


class KYCResponse(BaseModel):
    """Response returned after successful identity verification."""

    verified: bool = Field(..., description="Always ``true`` in the mock build.")
    persona_id: str = Field(..., description="Stable UUID assigned to this persona.")
    message: str = Field(..., description="Human-readable confirmation message.")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post(
    "/verify",
    response_model=KYCResponse,
    status_code=status.HTTP_200_OK,
    summary="Mock identity verification",
    description=(
        "Simulates NIMC/BVN/NIN liveness verification. "
        "Always returns ``verified: true`` after a brief delay. "
        "**This endpoint is intentionally mocked for the hackathon demo.** "
        "In production it delegates to a licensed KYC provider."
    ),
)
async def verify_kyc(payload: KYCRequest, db: DbDep) -> KYCResponse:
    """
    Verify a user's identity and issue their FOID persona.

    Parameters
    ----------
    payload : KYCRequest
        BVN, NIN, full name, and a selfie (ignored by mock).
    db : AsyncSession
        Injected database session.

    Returns
    -------
    KYCResponse
        Confirmation that verification succeeded and the new ``persona_id``.

    Notes
    -----
    - The 1.5-second delay simulates real KYC API round-trip latency.
    - User creation and credential issuance are delegated to the
      ``credential_issuer`` service (implemented in Phase 3).
    """
    # Simulate KYC API latency
    await asyncio.sleep(1.5)

    # Phase 3: replace this stub with real user creation + credential issuance
    from services.credential_issuer import issue_identity_claims
    persona_id = await issue_identity_claims(
        db=db,
        bvn=payload.bvn,
        nin=payload.nin,
        full_name=payload.full_name,
    )

    logger.info("KYC verification completed for persona %s.", persona_id)

    return KYCResponse(
        verified=True,
        persona_id=persona_id,
        message=(
            f"Identity verified successfully. "
            f"Your FOID persona ID is {persona_id}."
        ),
    )
