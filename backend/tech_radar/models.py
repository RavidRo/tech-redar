from datetime import datetime
from typing import Annotated

from beanie import Indexed
from beanie.odm.documents import Document
from pydantic import BaseModel


class StageTransition(BaseModel):
    originalStage: str
    transitionDate: datetime
    adrLink: str


class History(BaseModel):
    stageTransitions: list[StageTransition]
    discoveryDate: datetime


class Technology(Document):
    name: Annotated[str, Indexed(unique=True)]
    category: str
    stage: str
    tags: list[str]
    detailsPage: str | None
    history: History
