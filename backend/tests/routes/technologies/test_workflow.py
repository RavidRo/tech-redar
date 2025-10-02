"""Tests for CRUD operations on technologies API."""

from typing import Any

from fastapi import status
from httpx import AsyncClient, Response
from motor.motor_asyncio import AsyncIOMotorDatabase

from tech_radar.models import Technology


class TestTechnologyWorkflow:
    """Test complete technology lifecycle workflows."""

    async def test_complete_technology_lifecycle(
        self, async_client: AsyncClient, mock_db: AsyncIOMotorDatabase[Technology]
    ) -> None:
        """Test complete lifecycle: create -> update -> delete."""
        # 1. Create technology
        create_data = {
            "name": "Lifecycle Test Tech",
            "category": "Tools",
            "stage": "Assess",
            "tags": ["testing"],
            "detailsPage": "https://example.com",
        }

        create_response: Response = await async_client.put("/technologies/", json=create_data)
        assert create_response.status_code == status.HTTP_200_OK

        # 2. Verify creation
        get_response: Response = await async_client.get("/technologies/?search=Lifecycle Test Tech")
        assert len(get_response.json()["technologies"]) == 1

        # 3. Update technology
        update_data = {
            "category": "Platforms",
            "tags": ["testing", "updated"],
            "detailsPage": "https://updated.example.com",
            "stageTransition": {"newStage": "Trial", "adrLink": "https://example.com/adr/trial"},
        }

        update_response: Response = await async_client.post(
            "/technologies/Lifecycle Test Tech", json=update_data
        )
        assert update_response.status_code == status.HTTP_200_OK

        # 4. Verify update
        get_response = await async_client.get("/technologies/?search=Lifecycle Test Tech")
        tech_data = get_response.json()["technologies"][0]
        assert tech_data["category"] == "Platforms"
        assert tech_data["stage"] == "Trial"
        assert len(tech_data["history"]["stageTransitions"]) == 1

        # 5. Delete technology
        delete_response: Response = await async_client.delete("/technologies/Lifecycle Test Tech")
        assert delete_response.status_code == status.HTTP_200_OK

        # 6. Verify deletion
        get_response = await async_client.get("/technologies/?search=Lifecycle Test Tech")
        assert len(get_response.json()["technologies"]) == 0

    async def test_stage_progression_workflow(
        self, async_client: AsyncClient, mock_db: AsyncIOMotorDatabase[Technology]
    ) -> None:
        """Test typical stage progression workflow."""
        # Create technology in Assess stage
        create_data = {
            "name": "Stage Progression Tech",
            "category": "Languages & Frameworks",
            "stage": "Assess",
            "tags": ["new-tech"],
            "detailsPage": "https://example.com",
        }

        await async_client.put("/technologies/", json=create_data)

        # Progress through stages: Assess -> Trial -> Adopt
        stages: list[tuple[str, str]] = [
            ("Trial", "https://example.com/adr/trial"),
            ("Adopt", "https://example.com/adr/adopt"),
        ]

        for new_stage, adr_link in stages:
            update_data = {
                "category": "Languages & Frameworks",
                "tags": ["new-tech", "progressing"],
                "detailsPage": "https://example.com",
                "stageTransition": {"newStage": new_stage, "adrLink": adr_link},
            }

            response: Response = await async_client.post(
                "/technologies/Stage Progression Tech", json=update_data
            )
            assert response.status_code == status.HTTP_200_OK

        # Verify final state
        get_response: Response = await async_client.get(
            "/technologies/?search=Stage Progression Tech"
        )
        tech_data = get_response.json()["technologies"][0]

        assert tech_data["stage"] == "Adopt"
        assert len(tech_data["history"]["stageTransitions"]) == 2

        # Verify transition history
        transitions: list[dict[str, Any]] = tech_data["history"]["stageTransitions"]
        assert transitions[0]["originalStage"] == "Assess"
        assert transitions[1]["originalStage"] == "Trial"
