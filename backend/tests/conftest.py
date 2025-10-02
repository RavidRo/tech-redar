"""Test configuration and fixtures."""

import asyncio
from collections.abc import AsyncGenerator, Generator
from datetime import datetime
from typing import Any

import pytest
from beanie import init_beanie
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
from mongomock_motor import AsyncMongoMockClient
from motor.motor_asyncio import AsyncIOMotorDatabase

from tech_radar.main import app
from tech_radar.models import History, Technology


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def mock_db() -> AsyncGenerator[AsyncIOMotorDatabase[Any], None]:
    """Initialize mock database for testing."""
    client: AsyncMongoMockClient[Technology] = AsyncMongoMockClient()
    database: AsyncIOMotorDatabase[Technology] = client.get_database("test_tech_radar")
    await init_beanie(database=database, document_models=[Technology])  # type: ignore[arg-type]  # I'm not sure what is the problem but everything is working
    yield database
    # Cleanup after each test
    await Technology.delete_all()


@pytest.fixture
def test_client() -> TestClient:
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client for the FastAPI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
async def sample_technologies(mock_db: AsyncIOMotorDatabase[Any]) -> list[Technology]:
    """Create sample technologies for testing."""
    technologies = [
        Technology(
            name="React",
            category="Frameworks",
            stage="Adopt",
            tags=["frontend", "javascript", "ui"],
            detailsPage="https://react.dev",
            history=History(discoveryDate=datetime(2023, 1, 1), stageTransitions=[]),
        ),
        Technology(
            name="Docker",
            category="Development Tools",
            stage="Adopt",
            tags=["containerization", "devops"],
            detailsPage="https://docker.com",
            history=History(discoveryDate=datetime(2023, 2, 1), stageTransitions=[]),
        ),
        Technology(
            name="Kubernetes",
            category="Data Management",
            stage="Trial",
            tags=["orchestration", "devops", "cloud"],
            detailsPage="https://kubernetes.io",
            history=History(discoveryDate=datetime(2023, 3, 1), stageTransitions=[]),
        ),
        Technology(
            name="GraphQL",
            category="Frameworks",
            stage="Assess",
            tags=["api", "query-language"],
            detailsPage="https://graphql.org",
            history=History(discoveryDate=datetime(2023, 4, 1), stageTransitions=[]),
        ),
        Technology(
            name="Rust",
            category="Frameworks",
            stage="Hold",
            tags=["systems", "performance"],
            detailsPage="https://rust-lang.org",
            history=History(discoveryDate=datetime(2023, 5, 1), stageTransitions=[]),
        ),
    ]

    # Insert all technologies
    for tech in technologies:
        await tech.save()

    return technologies
