"""Tests for CRUD operations on technologies API."""

from fastapi import status
from httpx import AsyncClient, Response
from motor.motor_asyncio import AsyncIOMotorDatabase

from tech_radar.models import Technology


class TestDeleteTechnologiesEndpoint:
    """Test cases for the DELETE /technologies endpoint."""

    async def test_delete_technology_success(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test successful technology deletion."""
        response: Response = await async_client.delete("/technologies/React")

        assert response.status_code == status.HTTP_200_OK

        # Verify technology is deleted
        get_response: Response = await async_client.get("/technologies/?search=React")
        assert len(get_response.json()["technologies"]) == 0

    async def test_delete_nonexistent_technology(
        self, async_client: AsyncClient, mock_db: AsyncIOMotorDatabase[Technology]
    ) -> None:
        """Test deleting a technology that doesn't exist."""
        response: Response = await async_client.delete("/technologies/NonExistentTech")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "does not exists" in response.json()["detail"]
