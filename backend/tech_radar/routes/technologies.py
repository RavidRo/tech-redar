from datetime import datetime
from typing import Annotated, Any

from beanie.exceptions import RevisionIdWasChanged
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from tech_radar.models import (
    History,
    StageTransition,
    Technology,
    category_field,
    stage_field,
)
from tech_radar.routes.safe_endpoint import safe_endpoint

router = APIRouter(prefix="/technologies", tags=["technologies"])


class TechnologyMetadata(BaseModel):
    total_count: int
    categories: list[str]
    stages: list[str]
    available_tags: list[str]


class TechnologyResponse(BaseModel):
    technologies: list[Technology]
    metadata: TechnologyMetadata


@router.get("/", response_model=TechnologyResponse)
@safe_endpoint
async def get_technologies(
    search: Annotated[
        str | None, Query(description="Search across name, category, and tags")
    ] = None,
    categories: Annotated[list[str] | None, Query(description="Filter by categories")] = None,
    stages: Annotated[list[str] | None, Query(description="Filter by stages")] = None,
    tags: Annotated[list[str] | None, Query(description="Filter by tags")] = None,
) -> TechnologyResponse:
    # Build query filters
    query_filters: dict[str, Any] = {}

    # Text search across name, category, and tags
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        query_filters["$or"] = [
            {"name": search_regex},
            {"category": search_regex},
            {"tags": search_regex},
        ]

    if categories is not None:
        categories = [c for c in categories if len(c) > 0]
        if len(categories) > 0:
            query_filters["category"] = {"$in": categories}

    if stages is not None:
        stages = [s for s in stages if len(s) > 0]
        if stages:
            query_filters["stage"] = {"$in": stages}

    if tags is not None:
        tags = [t for t in tags if len(t) > 0]
        if tags:
            query_filters["tags"] = {"$in": tags}

    # Get filtered technologies
    if query_filters:
        technologies = await Technology.find(query_filters).to_list()
    else:
        technologies = await Technology.find_all().to_list()

    # Get metadata for frontend filters
    all_technologies = await Technology.find_all().to_list()

    # Extract unique categories, stages, and tags
    categories_set = set()
    stages_set = set()
    tags_set = set()

    for tech in all_technologies:
        categories_set.add(tech.category)
        stages_set.add(tech.stage)
        tags_set.update(tech.tags)

    metadata = TechnologyMetadata(
        total_count=len(technologies),
        categories=sorted(list(categories_set)),
        stages=sorted(list(stages_set)),
        available_tags=sorted(list(tags_set)),
    )

    return TechnologyResponse(technologies=technologies, metadata=metadata)


class PutTechnologyRequest(BaseModel):
    name: str
    category: str = category_field
    stage: str = stage_field
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
    category: str = category_field
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
