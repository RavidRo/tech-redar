from __future__ import annotations

from fastapi import FastAPI

app = FastAPI(title="tech-radar backend")


@app.get("/ping")
def ping() -> dict[str, str]:
    return {"status": "ok"}
