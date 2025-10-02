import asyncio
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
    """
    Retrieve a list of technologies with optional filtering and search capabilities.

    This endpoint returns all technologies in the system along with metadata about
    available categories, stages, and tags. Supports filtering by multiple criteria
    and text search across technology names, categories, and tags.

    Args:
        search: Optional text search that matches against technology name, category,
        and tags (case-insensitive)
        categories: Optional list of categories to filter by (OR operation)
        stages: Optional list of stages to filter by (OR operation)
        tags: Optional list of tags to filter by (OR operation)

    Returns:
        TechnologyResponse containing:
            - technologies: List of Technology objects matching the filters
            - metadata: TechnologyMetadata with total count and available filter options

    Note:
        All filters are applied with AND logic between different filter types,
        but OR logic within the same filter type (e.g., multiple categories).
    """
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

    technologies_task = Technology.find(query_filters).to_list()
    categories_task = Technology.distinct(Technology.category, query_filters)
    stages_task = Technology.distinct(Technology.stage, query_filters)

    # TODO: There seams to be some bug with beanie that throws an exception on this query.
    #       As a workaround I am fetching everything instead for now.
    # pipeline = [
    #     {"$unwind": "$tags"},  # Flatten the arrays
    #     {"$group": {"_id": None, "allTags": {"$addToSet": "$tags"}}},
    #     {"$project": {"_id": 0, "allTags": 1}},
    # ]
    # tags_task = Technology.aggregate(pipeline).to_list()
    all_technologies = await Technology.find_all().to_list()
    all_tags = {tag for tech in all_technologies for tag in tech.tags}

    technologies, all_categories, all_stages = await asyncio.gather(
        technologies_task,
        categories_task,
        stages_task,
        # tags_task,
    )

    metadata = TechnologyMetadata(
        total_count=len(technologies),
        categories=sorted(list(all_categories)),
        stages=sorted(list(all_stages)),
        available_tags=sorted(list(all_tags)),
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
    """
    create a new technology in the tech radar.

    Creates a new technology entry with the provided details. The technology will be
    initialized with a discovery date set to the current time and an empty stage
    transition history.

    Args:
        put_request: PutTechnologyRequest containing:
            - name: Unique name for the technology
            - category: Technology category (validated against predefined values)
            - stage: Current stage of the technology (validated against predefined values)
            - tags: List of tags associated with the technology
            - detailsPage: Optional URL to additional details about the technology

    Returns:
        Technology: The newly created technology object with generated ID and history

    Raises:
        HTTPException (409): If a technology with the same name already exists
    """
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
    """
    Delete a technology from the tech radar.

    Permanently removes a technology entry from the system. This operation
    cannot be undone and will remove all associated history and metadata.

    Args:
        name: The unique name of the technology to delete

    Returns:
        None

    Raises:
        HTTPException (404): If no technology with the specified name exists

    Warning:
        This operation is irreversible. All technology data including
        stage transition history will be permanently lost.
    """
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
    """
    Update an existing technology's details and optionally transition its stage.

    Updates the specified technology with new category, tags, and details page.
    If a stage transition is provided, it will update the technology's current stage
    and add a new entry to the stage transition history with the current timestamp.

    Args:
        name: The unique name of the technology to update
        update_request: UpdateTechnologyRequest containing:
            - category: New category for the technology
            - tags: Updated list of tags
            - detailsPage: Updated URL to technology details (can be None)
            - stageTransition: Optional stage transition containing:
                - newStage: The new stage to transition to
                - adrLink: Link to the Architecture Decision Record for this transition

    Returns:
        None

    Raises:
        HTTPException (404): If no technology with the specified name exists

    Note:
        Stage transitions are tracked in the technology's history. The original stage,
        transition date, and ADR link are preserved for audit purposes.
    """
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
