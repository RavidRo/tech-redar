from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class PingResponse(BaseModel):
    status: str


@router.get("/ping", response_model=PingResponse)
def ping() -> PingResponse:
    return PingResponse(status="ok")
