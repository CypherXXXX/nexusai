"""
CORS and error handling middleware for FastAPI.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config.settings import FRONTEND_URL
from src.utils.logger import get_logger

logger = get_logger("api.middleware")


def setup_middleware(app: FastAPI):
    """Configure CORS and error handling middleware."""

    # CORS — allow frontend origin
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            FRONTEND_URL,
            "http://localhost:3000",
            "http://localhost:3001",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled error: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "detail": str(exc),
            },
        )
