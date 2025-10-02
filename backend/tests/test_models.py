from datetime import datetime

import pytest
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import ValidationError

from tech_radar.models import History, Technology


class TestTechnologyModels:
    """Test cases for Technology model validation."""

    def test_valid_category_validation_are_accepted(
        self, mock_db: AsyncIOMotorDatabase[Technology]
    ) -> None:
        valid_categories: list[str] = ["Tools", "Techniques", "Platforms", "Languages & Frameworks"]

        for category in valid_categories:
            tech: Technology = Technology(
                name=f"Test-{category}",
                category=category,
                stage="Adopt",
                tags=["test"],
                detailsPage=None,
                history=History(discoveryDate=datetime.now(), stageTransitions=[]),
            )
            assert tech.category == category

    def test_invalid_category_validation_are_rejected(self) -> None:
        with pytest.raises(ValidationError):
            Technology(
                name="Test",
                category="InvalidCategory",
                stage="Adopt",
                tags=["test"],
                detailsPage=None,
                history=History(discoveryDate=datetime.now(), stageTransitions=[]),
            )

    def test_valid_stage_validation_are_accepted(
        self, mock_db: AsyncIOMotorDatabase[Technology]
    ) -> None:
        valid_stages: list[str] = ["Hold", "Assess", "Trial", "Adopt"]

        for stage in valid_stages:
            tech: Technology = Technology(
                name=f"Test-{stage}",
                category="Tools",
                stage=stage,
                tags=["test"],
                detailsPage=None,
                history=History(discoveryDate=datetime.now(), stageTransitions=[]),
            )
            assert tech.stage == stage

    def test_invalid_stage_validation_are_rejected(self) -> None:
        with pytest.raises(ValidationError):
            Technology(
                name="Test",
                category="Tools",
                stage="InvalidStage",
                tags=["test"],
                detailsPage=None,
                history=History(discoveryDate=datetime.now(), stageTransitions=[]),
            )
