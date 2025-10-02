"""Tests for CRUD operations on technologies API."""

from typing import Any

from fastapi import status
from httpx import AsyncClient, Response
from motor.motor_asyncio import AsyncIOMotorDatabase

from tech_radar.models import Technology


class TestUpdateTechnologiesEndpoint:
    """Test cases for the POST /technologies endpoint."""

    async def test_update_technology_success(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test successful technology update."""
        update_data = {
            "category": "Platforms",
            "tags": ["updated", "frontend"],
            "detailsPage": "https://updated-react.dev",
            "stageTransition": None,
        }

        response: Response = await async_client.post("/technologies/React", json=update_data)

        assert response.status_code == status.HTTP_200_OK

        # Verify technology is updated
        get_response: Response = await async_client.get("/technologies/?search=React")
        tech_data = get_response.json()["technologies"][0]

        assert tech_data["category"] == "Platforms"
        assert tech_data["tags"] == ["updated", "frontend"]
        assert tech_data["detailsPage"] == "https://updated-react.dev"

    async def test_update_technology_with_stage_transition(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test technology update with stage transition."""
        update_data = {
            "category": "Languages & Frameworks",
            "tags": ["frontend", "javascript"],
            "detailsPage": "https://react.dev",
            "stageTransition": {
                "newStage": "Hold",
                "adrLink": "https://example.com/adr/react-hold",
            },
        }

        response: Response = await async_client.post("/technologies/React", json=update_data)

        assert response.status_code == status.HTTP_200_OK

        # Verify stage transition is recorded
        get_response: Response = await async_client.get("/technologies/?search=React")
        tech_data = get_response.json()["technologies"][0]

        assert tech_data["stage"] == "Hold"
        assert len(tech_data["history"]["stageTransitions"]) == 1

        transition: dict[str, Any] = tech_data["history"]["stageTransitions"][0]
        assert transition["originalStage"] == "Adopt"  # Original stage from sample data
        assert transition["adrLink"] == "https://example.com/adr/react-hold"

    async def test_update_nonexistent_technology(
        self, async_client: AsyncClient, mock_db: AsyncIOMotorDatabase[Technology]
    ) -> None:
        """Test updating a technology that doesn't exist."""
        update_data = {
            "category": "Tools",
            "tags": ["test"],
            "detailsPage": None,
            "stageTransition": None,
        }

        response: Response = await async_client.post(
            "/technologies/NonExistentTech", json=update_data
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "does not exists" in response.json()["detail"]

    async def test_update_technology_invalid_data(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test technology update with invalid data."""
        update_data = {
            "category": "InvalidCategory",
            "tags": ["test"],
            "detailsPage": None,
            "stageTransition": None,
        }

        response: Response = await async_client.post("/technologies/React", json=update_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
