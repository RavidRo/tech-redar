from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from beanie import init_beanie
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import AsyncMongoClient

from tech_radar.models import Technology
from tech_radar.routes.ping import router as ping_router
from tech_radar.routes.technologies import router as technologies_router
from tech_radar.settings import SETTINGS


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    # Startup
    client: AsyncMongoClient[Technology] = AsyncMongoClient[Technology](str(SETTINGS.mongo_uri))
    await init_beanie(database=client.get_database("tech_radar"), document_models=[Technology])

    yield
    # Shutdown (if needed)


app = FastAPI(title="tech-radar backend", lifespan=lifespan)


# CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ping_router)
app.include_router(technologies_router)


class AppNameResponse(BaseModel):
    name: str


@app.get("/app-name", response_model=AppNameResponse)
def app_name() -> AppNameResponse:
    # Return as a const the name of the app
    return AppNameResponse(name="tech-radar")
