# ── Stage 1: build dependencies ───────────────────────────────────────────────
FROM python:3.12-slim AS builder

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

WORKDIR /app

# Copy dependency files first so Docker layer cache is reused on code changes
COPY pyproject.toml uv.lock ./

# Install dependencies into /app/.venv (no-editable, frozen, no dev deps)
RUN uv sync --frozen --no-dev --no-install-project


# ── Stage 2: runtime image ────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# Copy the pre-built venv from the builder stage
COPY --from=builder /app/.venv /app/.venv

# Copy application source — .dockerignore keeps .venv, __pycache__, .env out
COPY . .

# Make sure the venv is on PATH
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# ── Runtime environment defaults ──────────────────────────────────────────────
# These are safe defaults for Render deployment.
# Override via Render's Environment Variables UI — never commit secrets here.

# On Render, use Postgres by setting DATABASE_URL in the dashboard:
#   postgresql+asyncpg://user:pass@host:5432/foid_openbanking
# /data is a Render persistent disk mount (see render.yaml).
# Switch to postgresql+asyncpg:// when using Render Postgres.
ENV DATABASE_URL="sqlite+aiosqlite:////data/foid_openbanking.db" \
    DB_ECHO="false" \
    JWT_SECRET="change-me-before-production" \
    POLL_INTERVAL_SECONDS="300" \
    FEED_APPEND_SECONDS="30" \
    CORS_ORIGINS="*" \
    PORT="8000"

EXPOSE 8000

# Render injects $PORT at runtime — use shell form so the variable expands
CMD uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1
