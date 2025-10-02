from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from beanie import init_beanie
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import AsyncMongoClient

from tech_radar.models import Technology
from tech_radar.routes.ping import router as ping_router
from tech_radar.routes.technologies import router as technologies_router
from tech_radar.settings import load_settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    # Startup
    settings = load_settings()
    client: AsyncMongoClient[Technology] = AsyncMongoClient[Technology](str(settings.mongo_uri))
    await init_beanie(database=client.get_database("tech_radar"), document_models=[Technology])

    yield
    # Shutdown (if needed)


app = FastAPI(title="tech-radar backend", lifespan=lifespan)


origins = [
    "http://localhost",
    "http://localhost:5173",  # Your Vite frontend's origin
    "*",
]


# CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ping_router)
app.include_router(technologies_router)
