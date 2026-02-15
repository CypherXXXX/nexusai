from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.database_models import LeadRecord, EmailLog, UserUsage

async def create_lead(session: AsyncSession, data: dict) -> LeadRecord:
    record = LeadRecord(**data)
    session.add(record)
    await session.commit()
    await session.refresh(record)
    return record


async def get_lead(session: AsyncSession, lead_id: str) -> Optional[LeadRecord]:
    result = await session.execute(
        select(LeadRecord).where(LeadRecord.lead_id == lead_id)
    )
    return result.scalar_one_or_none()


async def list_leads(
    session: AsyncSession,
    *,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> list[LeadRecord]:
    query = select(LeadRecord).order_by(LeadRecord.created_at.desc())
    if status:
        query = query.where(LeadRecord.status == status)
    query = query.limit(limit).offset(offset)
    result = await session.execute(query)
    return list(result.scalars().all())


async def update_lead(session: AsyncSession, lead_id: str, data: dict) -> Optional[LeadRecord]:
    data["updated_at"] = datetime.now(timezone.utc)
    await session.execute(
        update(LeadRecord).where(LeadRecord.lead_id == lead_id).values(**data)
    )
    await session.commit()
    return await get_lead(session, lead_id)


async def delete_lead(session: AsyncSession, lead_id: str) -> bool:
    result = await session.execute(
        delete(LeadRecord).where(LeadRecord.lead_id == lead_id)
    )
    await session.commit()
    return result.rowcount > 0


async def count_leads(session: AsyncSession, status: Optional[str] = None) -> int:
    query = select(func.count(LeadRecord.lead_id))
    if status:
        query = query.where(LeadRecord.status == status)
    result = await session.execute(query)
    return result.scalar() or 0


async def get_review_queue(session: AsyncSession) -> list[LeadRecord]:
    result = await session.execute(
        select(LeadRecord)
        .where(LeadRecord.status == "human_review")
        .order_by(LeadRecord.score.desc())
    )
    return list(result.scalars().all())


async def get_score_distribution(session: AsyncSession) -> list[dict]:
    result = await session.execute(
        select(LeadRecord.score, func.count(LeadRecord.lead_id))
        .group_by(LeadRecord.score)
        .order_by(LeadRecord.score)
    )
    return [{"score": row[0], "count": row[1]} for row in result.all()]


async def get_status_counts(session: AsyncSession) -> dict[str, int]:
    result = await session.execute(
        select(LeadRecord.status, func.count(LeadRecord.lead_id))
        .group_by(LeadRecord.status)
    )
    return {row[0]: row[1] for row in result.all()}


async def get_analytics_summary(session: AsyncSession) -> dict:
    total = await count_leads(session)
    status_counts = await get_status_counts(session)

    avg_result = await session.execute(
        select(func.avg(LeadRecord.score))
        .where(LeadRecord.score > 0)
    )
    avg_score = avg_result.scalar() or 0

    time_result = await session.execute(
        select(func.avg(LeadRecord.processing_time_seconds))
        .where(LeadRecord.processing_time_seconds.isnot(None))
    )
    avg_time = time_result.scalar() or 0

    scored_count = await count_leads(session, status="drafting_complete") + \
                   await count_leads(session, status="human_review") + \
                   await count_leads(session, status="approved") + \
                   await count_leads(session, status="sent")
    failed_count = await count_leads(session, status="failed") + \
                   await count_leads(session, status="rejected")
    accuracy = round((scored_count / max(scored_count + failed_count, 1)) * 100)

    return {
        "total_leads": total,
        "status_counts": status_counts,
        "qualified": status_counts.get("sent", 0) + status_counts.get("approved", 0),
        "pending_review": status_counts.get("human_review", 0),
        "rejected": status_counts.get("rejected", 0),
        "avg_score": round(avg_score, 1),
        "avg_processing_time": round(avg_time, 2),
        "accuracy": accuracy,
    }




async def log_email(session: AsyncSession, data: dict) -> EmailLog:
    record = EmailLog(**data)
    session.add(record)
    await session.commit()
    return record


async def get_daily_usage(session: AsyncSession, user_id: str = "default") -> UserUsage:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    result = await session.execute(
        select(UserUsage)
        .where(UserUsage.user_id == user_id)
        .where(UserUsage.date == today)
    )
    usage = result.scalar_one_or_none()
    if not usage:
        usage = UserUsage(user_id=user_id, date=today, search_count=0, csv_count=0)
        session.add(usage)
        await session.commit()
        await session.refresh(usage)
    return usage


async def increment_search_count(session: AsyncSession, user_id: str = "default") -> UserUsage:
    usage = await get_daily_usage(session, user_id)
    usage.search_count = (usage.search_count or 0) + 1
    await session.commit()
    await session.refresh(usage)
    return usage


async def increment_csv_count(session: AsyncSession, user_id: str = "default") -> UserUsage:
    usage = await get_daily_usage(session, user_id)
    usage.csv_count = (usage.csv_count or 0) + 1
    await session.commit()
    await session.refresh(usage)
    return usage
