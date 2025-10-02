# syntax=docker/dockerfile:1.7

FROM python:3.11-slim

ENV PIP_NO_CACHE_DIR=1 \
	PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	POETRY_VERSION=2.2.1 \
	POETRY_VIRTUALENVS_IN_PROJECT=true

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y --no-install-recommends curl build-essential && \
	rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://install.python-poetry.org | python - --version "$POETRY_VERSION"
ENV PATH="/root/.local/bin:${PATH}"

# Copy deps for caching
COPY pyproject.toml poetry.lock* ./
RUN poetry install --with dev --no-interaction --no-root

# Default command uses fastapi dev server (CLI)
CMD ["bash", "-lc", "/usr/src/app/.venv/bin/fastapi dev tech_radar/app.py --host 0.0.0.0 --port 8000"]


