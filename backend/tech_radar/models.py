from datetime import datetime
from typing import Annotated

from beanie import Indexed
from beanie.odm.documents import Document
from pydantic import BaseModel, Field


class StageTransition(BaseModel):
    originalStage: str
    transitionDate: datetime
    adrLink: str


class History(BaseModel):
    stageTransitions: list[StageTransition]
    discoveryDate: datetime


category_field = Field(..., pattern="^(Tools|Techniques|Platforms|Languages & Frameworks)$")
stage_field = Field(..., pattern="^(Hold|Assess|Trial|Adopt)$")


class Technology(Document):
    name: Annotated[str, Indexed(unique=True)]
    category: str = category_field
    stage: str = stage_field
    tags: list[str]
    detailsPage: str | None
    history: History

    class Settings:
        indexes = [[("name", 1)], [("category", 1)], [("stage", 1)], [("tags", 1)]]
