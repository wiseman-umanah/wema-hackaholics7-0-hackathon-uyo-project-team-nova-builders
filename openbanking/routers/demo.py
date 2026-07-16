"""
routers/demo.py
---------------
Demo control panel endpoint.

Provides a single route that injects a synthetic trigger event directly into
the trigger engine, bypassing the 5-minute poll timer.

**This endpoint is a first-class demo requirement, not a debugging hack.**
It is the backend half of the "Simulate Missed Repayment" button shown on
stage.  It must be visible, labelled clearly, and work reliably.

Supported event types
~~~~~~~~~~~~~~~~~~~~~
- ``missed_repayment`` — simulates a bounced loan repayment debit
- ``income_drop``      — simulates a missing monthly income credit
- ``income_restored``  — simulates income credit reappearing
"""

import logging
from typing import Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
router = APIRouter()

# Exhaustive list of supported synthetic event types
EventType = Literal["missed_repayment", "income_drop", "income_restored"]


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class DemoInjectRequest(BaseModel):
    """Payload for the demo control panel inject button."""

    user_id: str = Field(
        ...,
        description="The persona UUID to inject the event for.",
        examples=["ada_001"],
    )
    event_type: EventType = Field(
        ...,
        description=(
            "Type of synthetic event to inject. "
            "``missed_repayment`` is the primary demo trigger."
        ),
        examples=["missed_repayment"],
    )


class DemoInjectResponse(BaseModel):
    """Confirmation returned after the synthetic event is injected."""

    injected: bool = Field(..., description="Always ``true`` on success.")
    event_type: EventType
    user_id: str
    message: str = Field(..., description="Human-readable confirmation.")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.post(
    "/inject",
    response_model=DemoInjectResponse,
    status_code=status.HTTP_200_OK,
    summary="Inject a synthetic trigger event (demo control panel)",
    description=(
        "Bypasses the 5-minute poll timer and fires a synthetic trigger "
        "directly into the trigger engine. "
        "Use this to demonstrate a real-time credential state change on stage. "
        "**Label the frontend button clearly: 'Demo: Simulate Missed Repayment'.**"
    ),
)
async def inject_event(payload: DemoInjectRequest) -> DemoInjectResponse:
    """
    Inject a synthetic Open Banking trigger event for the demo.

    Parameters
    ----------
    payload : DemoInjectRequest
        Target user ID and the type of event to simulate.

    Returns
    -------
    DemoInjectResponse
        Confirmation that the event was injected.

    Raises
    ------
    HTTPException (404)
        If the ``user_id`` does not exist.

    Notes
    -----
    Calls ``ob_poller.inject_event`` which builds a synthetic transaction
    dict and passes it directly to the trigger engine — the same evaluation
    path used by real poll cycles.  The SSE stream delivers the resulting
    state change to all subscribed browser tabs in under a second.

    Implemented in Phase 6.
    """
    from data import store
    from services.ob_poller import inject_event

    # Verify the user exists in the connected store
    if payload.user_id not in store.connected_users():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{payload.user_id}' not found or not connected.",
        )

    await inject_event(payload.user_id, payload.event_type)

    return DemoInjectResponse(
        injected=True,
        event_type=payload.event_type,
        user_id=payload.user_id,
        message=(
            f"Synthetic '{payload.event_type}' event injected for {payload.user_id}. "
            f"Check the SSE stream for the resulting state change."
        ),
    )
