import logging
from collections.abc import Awaitable, Callable
from functools import wraps
from typing import ParamSpec, TypeVar

from fastapi import HTTPException

logger = logging.getLogger(__name__)

P = ParamSpec("P")
R = TypeVar("R")  # The actual return type of the route handler


def safe_endpoint(func: Callable[P, Awaitable[R]]) -> Callable[P, Awaitable[R]]:
    """
    Decorator to catch all non-HTTP exceptions in a FastAPI route.
    Logs the original exception and re-raises an HTTPException(500).
    """

    @wraps(func)
    async def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        try:
            return await func(*args, **kwargs)
        except HTTPException:  # Let explicit HTTPExceptions pass through
            raise
        except Exception as exc:  # Catch any other exception
            logger.exception("Unhandled error in endpoint: %s", exc)
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    return wrapper
