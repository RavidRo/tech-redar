# tech-radar backend

Requirements: Python 3.11, Poetry

## Setup

### Poetry

```bash
cd backend
poetry env use python3.11
poetry install --with dev
```

## Run (dev)

```bash
poetry run uvicorn tech-radar.main:app --reload --port 8000
```

## Ping

```bash
curl http://127.0.0.1:8000/ping
# {"status":"ok"}
```

## Lint / Type check

```bash
poetry run ruff check .
poetry run ruff format .
poetry run mypy .
```
