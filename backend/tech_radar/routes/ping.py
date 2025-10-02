from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class PingResponse(BaseModel):
    status: str


@router.get("/ping", response_model=PingResponse)
def ping() -> PingResponse:
    """
    Health check endpoint to verify the API is running.

    This is a simple health check endpoint that returns a status message
    to confirm the API service is operational and responding to requests.
    Commonly used by load balancers, monitoring systems, and deployment
    pipelines to verify service availability.

    Returns:
        PingResponse: Contains status field with value "ok"

    Note:
        This endpoint does not require authentication and should always
        return a 200 status code when the service is healthy.
    """
    return PingResponse(status="ok")
