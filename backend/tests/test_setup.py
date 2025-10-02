"""Basic setup and configuration tests."""

from motor.motor_asyncio import AsyncIOMotorDatabase

from tech_radar.models import History, Technology
from tech_radar.routes.technologies import TechnologyMetadata, TechnologyResponse


class TestBasicSetup:
    """Test basic setup and configuration."""

    def test_imports_work(self) -> None:
        """Test that all required imports work."""
        # If we get here, imports are working
        assert Technology is not None
        assert History is not None
        assert TechnologyResponse is not None
        assert TechnologyMetadata is not None

    async def test_mock_db_setup(self, mock_db: AsyncIOMotorDatabase[Technology]) -> None:
        """Test that mock database setup works."""
        # Should be able to query empty database
        technologies: list[Technology] = await Technology.find_all().to_list()
        assert technologies == []

    async def test_sample_data_fixture(
        self, mock_db: AsyncIOMotorDatabase[Technology], sample_technologies: list[Technology]
    ) -> None:
        """Test that sample data fixture works."""
        technologies: list[Technology] = await Technology.find_all().to_list()
        received_names: set[str] = {tech.name for tech in technologies}
        expected_names: set[str] = {tech.name for tech in sample_technologies}
        assert received_names == expected_names
