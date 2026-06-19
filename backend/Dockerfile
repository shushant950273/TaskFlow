# ─── Stage 1: Build ────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system deps needed by psycopg2-binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ─── Stage 2: Runtime ──────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/home/appuser/.local/bin:$PATH"

# Create non-root user for security
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code
COPY --chown=appuser:appgroup . .

# Collect static files (requires SECRET_KEY to be set — use a dummy for this step)
RUN SECRET_KEY=collectstatic-dummy-key DEBUG=False \
    python manage.py collectstatic --noinput

# Switch to non-root user
USER appuser

EXPOSE 8000

# Use Daphne for ASGI/WebSocket support
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "taskflow_api.asgi:application"]
