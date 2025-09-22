from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .database import Base, engine, get_session
from .models import Entry


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown (if needed)


app = FastAPI(title="tech-radar backend", lifespan=lifespan)


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


class EntryCreate(BaseModel):
    title: str
    description: str | None = None


class EntryResponse(BaseModel):
    id: int
    title: str
    description: str | None
    created_at: str

    class Config:
        from_attributes = True


@app.get("/ping", response_model=PingResponse)
def ping() -> PingResponse:
    return PingResponse(status="ok")


@app.get("/app-name", response_model=AppNameResponse)
def app_name() -> AppNameResponse:
    # Return as a const the name of the app
    return AppNameResponse(name="tech-radar")


@app.put("/entry", response_model=EntryResponse)
async def create_entry(
    entry: EntryCreate, session: Annotated[AsyncSession, Depends(get_session)]
) -> EntryResponse:
    db_entry = Entry(title=entry.title, description=entry.description)
    session.add(db_entry)
    await session.commit()
    await session.refresh(db_entry)
    return EntryResponse(
        id=db_entry.id,
        title=db_entry.title,
        description=db_entry.description,
        created_at=db_entry.created_at.isoformat(),
    )


@app.get("/entries", response_model=list[EntryResponse])
async def list_entries(
    session: Annotated[AsyncSession, Depends(get_session)],
) -> list[EntryResponse]:
    result = await session.execute(select(Entry).order_by(Entry.id))
    entries = result.scalars().all()
    return [
        EntryResponse(
            id=e.id,
            title=e.title,
            description=e.description,
            created_at=e.created_at.isoformat(),
        )
        for e in entries
    ]
