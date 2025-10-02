from datetime import datetime

from beanie.exceptions import RevisionIdWasChanged
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from tech_radar.models import History, StageTransition, Technology
from tech_radar.routes.safe_endpoint import safe_endpoint

router = APIRouter(prefix="/technologies", tags=["technologies"])


@router.get("/", response_model=list[Technology])
@safe_endpoint
async def get_technologies() -> list[Technology]:
    return await Technology.find_all().to_list()


class PutTechnologyRequest(BaseModel):
    name: str
    category: str
    stage: str
    tags: list[str] = Field(default=[])
    detailsPage: str | None = Field(default=None)


@router.put("/", response_model=Technology)
@safe_endpoint
async def put_technology(put_request: PutTechnologyRequest) -> Technology:
    technology = Technology(
        name=put_request.name,
        category=put_request.category,
        stage=put_request.stage,
        tags=put_request.tags,
        detailsPage=put_request.detailsPage,
        history=History(
            discoveryDate=datetime.now(),
            stageTransitions=[],
        ),
    )
    try:
        await technology.save()
    except (DuplicateKeyError, RevisionIdWasChanged) as err:
        raise HTTPException(
            status_code=409,
            detail=f"Technology with the name '{put_request.name}' already exists",
        ) from err

    return technology


@router.delete("/{name}")
@safe_endpoint
async def delete_technology(name: str) -> None:
    tech = Technology.find_one(Technology.name == name)
    if not await tech.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Technology with the name '{name}' does not exists",
        )

    await tech.delete()


class NewStageTransition(BaseModel):
    newStage: str
    adrLink: str


class UpdateTechnologyRequest(BaseModel):
    category: str
    tags: list[str]
    detailsPage: str | None
    stageTransition: NewStageTransition | None


@router.post("/{name}")
@safe_endpoint
async def update_technology(
    name: str,
    update_request: UpdateTechnologyRequest,
) -> None:
    tech = await Technology.find_one(Technology.name == name)
    if tech is None:
        raise HTTPException(
            status_code=404,
            detail=f"Technology with the name '{name}' does not exists",
        )

    await tech.set(
        {
            Technology.category: update_request.category,
            Technology.stage: (
                tech.stage
                if update_request.stageTransition is None
                else update_request.stageTransition.newStage
            ),
            Technology.tags: update_request.tags,
            Technology.detailsPage: update_request.detailsPage,
            Technology.history.stageTransitions: [
                *tech.history.stageTransitions,
                *(
                    []
                    if update_request.stageTransition is None
                    else [
                        StageTransition(
                            originalStage=tech.stage,
                            adrLink=update_request.stageTransition.adrLink,
                            transitionDate=datetime.now(),
                        )
                    ]
                ),
            ],
        }
    )
