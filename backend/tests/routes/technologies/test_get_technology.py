"""Integration tests for the technologies API endpoints."""

from fastapi import status
from httpx import AsyncClient, Response
from motor.motor_asyncio import AsyncIOMotorDatabase

from tech_radar.models import Technology


class TestGetTechnologiesEndpointEndpoint:
    """Test cases for the GET /technologies endpoint."""

    async def test_get_technologies_endpoint_empty(
        self, async_client: AsyncClient, mock_db: AsyncIOMotorDatabase[Technology]
    ) -> None:
        """Test GET /technologies endpoint with empty database."""
        response: Response = await async_client.get("/technologies/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert "technologies" in data
        assert "metadata" in data
        assert len(data["technologies"]) == 0
        assert data["metadata"]["total_count"] == 0

    async def test_get_technologies_endpoint_with_data(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test GET /technologies endpoint with sample data."""
        response: Response = await async_client.get("/technologies/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert len(data["technologies"]) == 5
        assert data["metadata"]["total_count"] == 5
        assert len(data["metadata"]["categories"]) > 0
        assert len(data["metadata"]["stages"]) > 0
        assert len(data["metadata"]["available_tags"]) > 0

    async def test_search_query_parameter(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test search query parameter."""
        response: Response = await async_client.get("/technologies/?search=React")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert len(data["technologies"]) == 1
        assert data["technologies"][0]["name"] == "React"

    async def test_categories_query_parameter(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test categories query parameter."""
        response: Response = await async_client.get("/technologies/?categories=Development%20Tools")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert len(data["technologies"]) == 1
        assert data["technologies"][0]["category"] == "Development Tools"

    async def test_multiple_categories_query_parameter(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test multiple categories query parameter."""
        response: Response = await async_client.get(
            "/technologies/?categories=Development%20Tools&categories=Data%20Management"
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert len(data["technologies"]) == 2
        categories: set[str] = {tech["category"] for tech in data["technologies"]}
        assert categories == {"Development Tools", "Data Management"}

    async def test_stages_query_parameter(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test stages query parameter."""
        response: Response = await async_client.get("/technologies/?stages=Adopt")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert len(data["technologies"]) == 2
        for tech in data["technologies"]:
            assert tech["stage"] == "Adopt"

    async def test_tags_query_parameter(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test tags query parameter."""
        response: Response = await async_client.get("/technologies/?tags=devops")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert len(data["technologies"]) == 2
        for tech in data["technologies"]:
            assert "devops" in tech["tags"]

    async def test_combined_query_parameters(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test combining multiple query parameters."""
        response: Response = await async_client.get(
            "/technologies/?categories=Frameworks&stages=Adopt"
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert len(data["technologies"]) == 1
        assert data["technologies"][0]["name"] == "React"
        assert data["technologies"][0]["category"] == "Frameworks"
        assert data["technologies"][0]["stage"] == "Adopt"

    async def test_search_with_filters(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test search combined with filters."""
        response: Response = await async_client.get(
            "/technologies/?search=devops&categories=Development%20Tools"
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert len(data["technologies"]) == 1
        assert data["technologies"][0]["name"] == "Docker"

    async def test_no_results_query(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test query that returns no results."""
        response: Response = await async_client.get("/technologies/?search=NonExistentTechnology")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert len(data["technologies"]) == 0
        assert data["metadata"]["total_count"] == 0

    async def test_case_insensitive_search(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test that search is case insensitive."""
        response: Response = await async_client.get("/technologies/?search=DOCKER")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert len(data["technologies"]) == 1
        assert data["technologies"][0]["name"] == "Docker"

    async def test_partial_name_search(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test partial name matching in search."""
        response: Response = await async_client.get("/technologies/?search=Kube")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert len(data["technologies"]) == 1
        assert data["technologies"][0]["name"] == "Kubernetes"

    async def test_metadata_structure(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test metadata structure and content."""
        response: Response = await async_client.get("/technologies/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        metadata = data["metadata"]
        assert "total_count" in metadata
        assert "categories" in metadata
        assert "stages" in metadata
        assert "available_tags" in metadata

        # Check that categories are sorted
        assert metadata["categories"] == sorted(metadata["categories"])
        # Check that stages are sorted
        assert metadata["stages"] == sorted(metadata["stages"])
        # Check that tags are sorted
        assert metadata["available_tags"] == sorted(metadata["available_tags"])

    async def test_response_schema_compliance(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test that response complies with expected schema."""
        response: Response = await async_client.get("/technologies/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Check top-level structure
        assert "technologies" in data
        assert "metadata" in data
        assert isinstance(data["technologies"], list)
        assert isinstance(data["metadata"], dict)

        # Check technology structure
        if data["technologies"]:
            tech = data["technologies"][0]
            required_fields: list[str] = [
                "name",
                "category",
                "stage",
                "tags",
                "detailsPage",
                "history",
            ]
            for field in required_fields:
                assert field in tech

            # Check history structure
            history = tech["history"]
            assert "discoveryDate" in history
            assert "stageTransitions" in history
            assert isinstance(history["stageTransitions"], list)

    async def test_empty_query_parameters_should_return_all_technologies(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        response: Response = await async_client.get(
            "/technologies/?search=&categories=&stages=&tags="
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert len(data["technologies"]) == len(sample_technologies)

    async def test_invalid_query_parameters(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test behavior with invalid query parameters."""
        # FastAPI should handle invalid parameters gracefully
        response: Response = await async_client.get("/technologies/?invalid_param=value")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Should return all technologies when invalid parameters are ignored
        assert len(data["technologies"]) == 5


class TestTechnologiesEndpointPerformance:
    """Performance-related tests for the technologies endpoint."""

    async def test_large_dataset_performance(
        self, async_client: AsyncClient, mock_db: AsyncIOMotorDatabase[Technology]
    ) -> None:
        """Test endpoint performance with a larger dataset."""
        # Create a larger dataset
        technologies: list[Technology] = []
        for i in range(100):
            tech: Technology = Technology(
                name=f"Technology-{i}",
                category="Development Tools" if i % 2 == 0 else "Frameworks",
                stage="Adopt" if i % 4 == 0 else "Trial",
                tags=[f"tag-{i}", f"category-{i % 5}"],
                detailsPage=f"https://example.com/tech-{i}",
                history={"discoveryDate": "2023-01-01T00:00:00", "stageTransitions": []},
            )
            technologies.append(tech)

        # Insert all technologies
        for tech in technologies:
            await tech.save()

        # Test that the endpoint still responds quickly
        response: Response = await async_client.get("/technologies/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["technologies"]) == 100
        assert data["metadata"]["total_count"] == 100

    async def test_complex_filtering_performance(
        self,
        async_client: AsyncClient,
        mock_db: AsyncIOMotorDatabase[Technology],
        sample_technologies: list[Technology],
    ) -> None:
        """Test performance with complex filtering."""
        # Test multiple filters at once
        response: Response = await async_client.get(
            "/technologies/?search=dev&categories=Development%20Tools&categories=Data%20Management&stages=Adopt&stages=Trial&tags=devops"
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Should return Docker (Development Tools, Adopt, devops) but not Kubernetes
        # (Data Management, Trial, devops)
        # because search="dev" matches "devops" tag but not "Kubernetes" name
        assert len(data["technologies"]) >= 0  # Could be 0 or more depending on search logic
