"""
routers/events.py
-----------------
Server-Sent Events (SSE) stream endpoint.

The frontend subscribes to ``GET /api/events/stream?user_id=<id>`` and
receives a push notification the moment a credential state changes — no
polling from the browser required.

Each event is a JSON-encoded ``CredentialStateEvent`` object delivered as::

    data: {"claim": "repayment_reliability", "state": "downgraded", ...}\n\n

The TypeScript ``useSSE`` hook in the frontend consumes this stream directly
via the browser's native ``EventSource`` API.
"""

import asyncio
import json
import logging
from typing import AsyncGenerator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from data import store

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------------------------------------------------------------------------
# SSE helpers
# ---------------------------------------------------------------------------


async def _event_generator(user_id: str) -> AsyncGenerator[str, None]:
    """
    Yield SSE-formatted strings from the user's subscriber queue.

    A new ``asyncio.Queue`` is registered in ``store.sse_subscribers`` for
    each open browser connection.  The queue is removed on disconnect to
    prevent memory leaks.

    Parameters
    ----------
    user_id : str
        The persona UUID to stream events for.

    Yields
    ------
    str
        SSE-formatted string: ``data: <json>\\n\\n``
    """
    queue: asyncio.Queue = asyncio.Queue()

    # Register this subscriber
    store.sse_subscribers.setdefault(user_id, []).append(queue)
    logger.info("SSE subscriber registered for user %s (total: %d).",
                user_id, len(store.sse_subscribers[user_id]))

    try:
        # Send an initial connection-confirmed event so the client knows it's live
        yield f"data: {json.dumps({'type': 'connected', 'user_id': user_id})}\n\n"

        while True:
            try:
                # Wait up to 15 s for a real event, then send a heartbeat comment
                # so the connection doesn't silently time out through proxies/curl
                event: dict = await asyncio.wait_for(queue.get(), timeout=15.0)
                yield f"data: {json.dumps(event)}\n\n"
            except asyncio.TimeoutError:
                # SSE comment line — keeps the connection alive, invisible to EventSource
                yield ": heartbeat\n\n"

    finally:
        # Clean up — remove this queue when the client disconnects
        subscribers = store.sse_subscribers.get(user_id, [])
        if queue in subscribers:
            subscribers.remove(queue)
        logger.info("SSE subscriber removed for user %s (remaining: %d).",
                    user_id, len(subscribers))


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@router.get(
    "/stream",
    summary="Subscribe to real-time credential state events (SSE)",
    description=(
        "Opens a persistent Server-Sent Events stream. "
        "The frontend receives a push notification the instant a credential "
        "state changes — no polling required. "
        "Connect via the browser's native ``EventSource`` API or the "
        "``useSSE`` TypeScript hook in the frontend."
    ),
    response_class=StreamingResponse,
)
async def event_stream(user_id: str) -> StreamingResponse:
    """
    Return a streaming SSE response for the given user.

    Parameters
    ----------
    user_id : str
        The persona UUID to subscribe to.

    Returns
    -------
    StreamingResponse
        An infinite SSE stream that emits ``CredentialStateEvent`` objects
        whenever the trigger engine changes credential state.
    """
    return StreamingResponse(
        _event_generator(user_id),
        media_type="text/event-stream",
        headers={
            # Disable buffering on Nginx / proxies so events are delivered immediately
            "X-Accel-Buffering": "no",
            "Cache-Control": "no-cache",
        },
    )
