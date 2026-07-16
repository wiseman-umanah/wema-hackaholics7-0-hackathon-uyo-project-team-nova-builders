"""
main.py
-------
FOID — Open Banking Polling Service

Entry point for the FastAPI application.

Startup sequence
~~~~~~~~~~~~~~~~
1. ``lifespan`` creates all database tables (SQLite dev / Postgres prod).
2. ``lifespan`` seeds the two demo personas if they don't already exist.
3. ``lifespan`` launches the Open Banking polling loop as a background task.
4. The polling loop is cancelled cleanly on shutdown.

Running
~~~~~~~
Development::

    uv run uvicorn main:app --reload

Production::

    uv run uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
"""

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()  # Load .env before any os.getenv() calls

from db.base import engine, Base
from routers import credentials, consent, demo, events, kyc

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan — startup / shutdown
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Manage application lifespan events.

    On startup
    ----------
    - Create all database tables that do not yet exist.
    - Seed demo personas (idempotent).
    - Start the Open Banking polling loop as an ``asyncio`` background task.

    On shutdown
    -----------
    - Cancel the polling task and wait for it to exit cleanly.
    """
    # 1. Create tables — models must be imported first so Base.metadata is populated
    import db.models  # noqa: F401 — registers all ORM models onto Base.metadata
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created / verified.")

    # 2. Seed demo data
    from data.seed import seed_demo_personas
    await seed_demo_personas()
    logger.info("Demo personas seeded.")

    # 3. Start polling loop + feed simulator as concurrent background tasks
    from services.ob_poller import polling_loop
    from services.feed_simulator import feed_append_loop

    poll_task = asyncio.create_task(polling_loop(),    name="ob_polling_loop")
    feed_task = asyncio.create_task(feed_append_loop(), name="feed_simulator")
    logger.info("Open Banking polling loop and feed simulator started.")

    yield  # application runs here

    # 4. Shut down both background tasks cleanly
    for task in (poll_task, feed_task):
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
    logger.info("Background tasks stopped.")


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------


def create_app() -> FastAPI:
    """
    Construct and configure the FastAPI application instance.

    Returns
    -------
    FastAPI
        The fully configured application ready to be served.
    """
    application = FastAPI(
        title="FOID — Open Banking Polling Service",
        description=(
            "Mock Open Banking polling service for the FOID hackathon demo.\n\n"
            "Polls a simulated transaction feed every ``POLL_INTERVAL_SECONDS`` "
            "seconds, evaluates rule-based triggers, and pushes credential state "
            "changes to connected frontends via Server-Sent Events."
        ),
        version="0.1.0",
        lifespan=lifespan,
    )

    # CORS — allow the Vite dev server and any explicitly listed origins
    allowed_origins: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
        ).split(",")
        if origin.strip()
    ]
    application.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    application.include_router(kyc.router,         prefix="/api/kyc",         tags=["KYC"])
    application.include_router(credentials.router, prefix="/api/credentials", tags=["Credentials"])
    application.include_router(consent.router,     prefix="/api/consent",     tags=["Consent"])
    application.include_router(events.router,      prefix="/api/events",      tags=["Events"])
    application.include_router(demo.router,        prefix="/api/demo",        tags=["Demo"])

    return application


app: FastAPI = create_app()


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health", tags=["Health"], summary="Service health check")
async def health() -> dict[str, str]:
    """
    Return a simple liveness signal.

    Used by load balancers and the frontend to confirm the service is up.

    Returns
    -------
    dict
        ``{"status": "ok", "service": "openbanking-polling"}``
    """
    return {"status": "ok", "service": "openbanking-polling"}


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    )
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("RELOAD", "true").lower() == "true",
        log_level="info",
    )
