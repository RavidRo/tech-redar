from datetime import datetime

from beanie.exceptions import RevisionIdWasChanged
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from tech_radar.models import History, InitialDiscovery, Technology

router = APIRouter(prefix="/technologies", tags=["technologies"])


class PutTechnologyRequest(BaseModel):
    name: str
    category: str
    stage: str
    tags: list[str] = Field(default=[])
    adrLink: str | None = Field(default=None)


@router.get("/", response_model=list[Technology])
async def get_technologies() -> list[Technology]:
    return await Technology.find_all().to_list()


@router.put("/", response_model=Technology)
async def put_technology(technology_request: PutTechnologyRequest) -> Technology:
    technology = Technology(
        name=technology_request.name,
        category=technology_request.category,
        stage=technology_request.stage,
        tags=technology_request.tags,
        history=History(
            discovery=InitialDiscovery(
                discoveryDate=datetime.now(),
                adrLink=technology_request.adrLink,
            ),
            stageTransitions=[],
        ),
    )
    try:
        await technology.save()
    except (DuplicateKeyError, RevisionIdWasChanged) as err:
        raise HTTPException(
            status_code=409,
            detail=f"Technology with the name '{technology_request.name}' already exists",
        ) from err

    return technology


@router.delete("/{name}")
async def delete_technology(name: str) -> None:
    print(f"Deleting {name}")
    tech = Technology.find_one(Technology.name == name)
    if not await tech.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Technology with the name '{name}' does not exists",
        )

    await tech.delete()
