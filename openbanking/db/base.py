"""
db/base.py
----------
SQLAlchemy async engine and session factory.

Database URL is read from the environment variable ``DATABASE_URL``.
- Development / testing : ``sqlite+aiosqlite:///./foid_openbanking.db``
- Production (Postgres) : ``postgresql+asyncpg://user:pass@host/dbname``

Swapping environments requires only a ``DATABASE_URL`` change — no code edits.
"""

import os
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./foid_openbanking.db",
)

engine = create_async_engine(
    DATABASE_URL,
    # echo=True logs every SQL statement — useful during development
    echo=os.getenv("DB_ECHO", "false").lower() == "true",
    # SQLite-specific: allow the same connection to be used across threads
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# ---------------------------------------------------------------------------
# Declarative base — all ORM models inherit from this
# ---------------------------------------------------------------------------


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models in this service."""
    pass
