from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="tech-radar backend")


# CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PingResponse(BaseModel):
    status: str


class AppNameResponse(BaseModel):
    name: str


@app.get("/ping", response_model=PingResponse)
def ping() -> PingResponse:
    return PingResponse(status="ok")


@app.get("/app-name", response_model=AppNameResponse)
def app_name() -> AppNameResponse:
    # Return as a const the name of the app
    return AppNameResponse(name="tech-radar")
