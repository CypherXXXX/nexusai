"""
NexusAI — FastAPI Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI

from src.database.connection import init_db
from api.middleware import setup_middleware
from api.routes.leads import router as leads_router
from api.routes.review import router as review_router
from api.routes.analytics import router as analytics_router
from api.routes.upload import router as upload_router
from src.utils.logger import get_logger

logger = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting NexusAI API...")
    await init_db()
    logger.info("Database initialized")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="NexusAI API",
    description="Autonomous AI Sales Lead Qualification Agent",
    version="2.0.0",
    lifespan=lifespan,
)

setup_middleware(app)

app.include_router(leads_router)
app.include_router(review_router)
app.include_router(analytics_router)
app.include_router(upload_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "nexusai"}


if __name__ == "__main__":
    import uvicorn
    from config.settings import BACKEND_HOST, BACKEND_PORT

    uvicorn.run(
        "main:app",
        host=BACKEND_HOST,
        port=BACKEND_PORT,
        reload=True,
    )
