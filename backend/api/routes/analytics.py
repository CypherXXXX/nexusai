from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_session
from src.database import operations as db

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
async def get_summary(
    session: AsyncSession = Depends(get_session),
):
    return await db.get_analytics_summary(session)


@router.get("/score-distribution")
async def get_score_distribution(
    session: AsyncSession = Depends(get_session),
):
    return await db.get_score_distribution(session)


@router.get("/status-counts")
async def get_status_counts(
    session: AsyncSession = Depends(get_session),
):
    return await db.get_status_counts(session)


@router.get("/usage")
async def get_usage(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    user_id = request.headers.get("X-User-Id", "default")
    usage = await db.get_daily_usage(session, user_id)
    return usage.to_dict()
