from __future__ import annotations

import uuid
import asyncio
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_session
from src.database import operations as db
from src.graph.workflow import graph
from src.graph.edges.routing import get_human_review_reason
from src.utils.logger import get_logger

logger = get_logger("api.leads")
router = APIRouter(prefix="/api/leads", tags=["leads"])


class CreateLeadRequest(BaseModel):
    company_name: str
    company_website: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_title: Optional[str] = None


class LeadResponse(BaseModel):
    lead_id: str
    company_name: str
    company_website: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_title: Optional[str] = None
    source: str = "manual"
    company_description: Optional[str] = None
    industry: Optional[str] = None
    is_b2b: Optional[bool] = None
    employee_count: Optional[str] = None
    company_size_category: Optional[str] = None
    score: int = 0
    score_breakdown: Optional[dict] = None
    scoring_reasoning: Optional[str] = None
    confidence: float = 0.0
    draft_email_subject: Optional[str] = None
    draft_email_body: Optional[str] = None
    personalization_hooks: Optional[list] = None
    pain_points: Optional[list] = None
    buying_signals: Optional[list] = None
    tech_stack: Optional[list] = None
    open_positions: Optional[list] = None
    recent_news: Optional[list] = None
    ceo_name: Optional[str] = None
    ceo_title: Optional[str] = None
    ceo_linkedin: Optional[str] = None
    company_email: Optional[str] = None
    hr_email: Optional[str] = None
    headquarters: Optional[str] = None
    founded_year: Optional[str] = None
    funding_status: Optional[str] = None
    social_profiles: Optional[dict] = None
    status: str = "new"
    human_review_reason: Optional[str] = None
    human_feedback: Optional[str] = None
    error_message: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    processing_time_seconds: Optional[float] = None

    class Config:
        from_attributes = True


def _get_user_id(request: Request) -> str:
    return request.headers.get("X-User-Id", "default")


@router.post("", response_model=LeadResponse)
async def create_lead(
    req: CreateLeadRequest,
    session: AsyncSession = Depends(get_session),
):
    now = datetime.now(timezone.utc)
    data = {
        "lead_id": str(uuid.uuid4()),
        "company_name": req.company_name,
        "company_website": req.company_website,
        "contact_name": req.contact_name,
        "contact_email": req.contact_email,
        "contact_title": req.contact_title,
        "source": "manual",
        "status": "new",
        "score": 0,
        "confidence": 0.0,
        "created_at": now,
        "updated_at": now,
    }

    record = await db.create_lead(session, data)
    return LeadResponse(**record.to_dict())


@router.get("", response_model=list[LeadResponse])
async def list_leads(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
):
    records = await db.list_leads(session, status=status, limit=limit, offset=offset)
    return [LeadResponse(**r.to_dict()) for r in records]


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: str,
    session: AsyncSession = Depends(get_session),
):
    record = await db.get_lead(session, lead_id)
    if not record:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadResponse(**record.to_dict())


@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: str,
    session: AsyncSession = Depends(get_session),
):
    deleted = await db.delete_lead(session, lead_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted", "lead_id": lead_id}


@router.post("/{lead_id}/process")
async def process_lead(
    lead_id: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    record = await db.get_lead(session, lead_id)
    if not record:
        raise HTTPException(status_code=404, detail="Lead not found")

    user_id = _get_user_id(request)
    usage = await db.get_daily_usage(session, user_id)
    if usage.search_count >= 5:
        raise HTTPException(
            status_code=429,
            detail="Daily search limit reached (5/day on Free tier). Upgrade to Pro for 50 searches/day."
        )

    await db.increment_search_count(session, user_id)

    lead_data = record.to_dict()

    sender_name = request.headers.get("X-Sender-Name", "NexusAI Team")
    lead_data["sender_name"] = sender_name

    await db.update_lead(session, lead_id, {"status": "researching"})

    async def run_pipeline():
        try:
            start_time = datetime.now(timezone.utc)
            config = {"configurable": {"thread_id": lead_id}}

            result = await graph.ainvoke(lead_data, config=config)

            elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
            result["processing_time_seconds"] = elapsed

            valid_columns = {c.name for c in db.LeadRecord.__table__.columns}
            filtered_result = {
                k: v for k, v in result.items()
                if k in valid_columns and k not in ["created_at", "updated_at"]
            }

            async for s in get_session():
                try:
                    if result.get("status") == "human_review":
                        filtered_result["human_review_reason"] = get_human_review_reason(result)

                    await db.update_lead(s, lead_id, filtered_result)
                    break
                except Exception:
                    raise

        except Exception as e:
            logger.error(f"Pipeline failed for {lead_id}: {e}")
            async for s in get_session():
                try:
                    await db.update_lead(s, lead_id, {
                        "status": "failed",
                        "error_message": str(e),
                    })
                    break
                except Exception:
                    pass

    asyncio.create_task(run_pipeline())

    return {
        "message": "Pipeline started",
        "lead_id": lead_id,
        "status": "researching",
    }


@router.post("/batch-process")
async def batch_process(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    leads = await db.list_leads(session, status="new")
    started = []
    sender_name = request.headers.get("X-Sender-Name", "NexusAI Team")

    for lead in leads:
        lead_data = lead.to_dict()
        lead_data["sender_name"] = sender_name
        await db.update_lead(session, lead.lead_id, {"status": "researching"})

        async def run(ld=lead_data, lid=lead.lead_id):
            try:
                start_time = datetime.now(timezone.utc)
                config = {"configurable": {"thread_id": lid}}
                result = await graph.ainvoke(ld, config=config)
                elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
                result["processing_time_seconds"] = elapsed

                valid_columns = {c.name for c in db.LeadRecord.__table__.columns}
                filtered_result = {
                    k: v for k, v in result.items()
                    if k in valid_columns and k not in ["created_at", "updated_at"]
                }

                async for s in get_session():
                    try:
                        if result.get("status") == "human_review":
                            filtered_result["human_review_reason"] = get_human_review_reason(result)
                        await db.update_lead(s, lid, filtered_result)
                        break
                    except Exception:
                        raise

            except Exception as e:
                logger.error(f"Pipeline failed for {lid}: {e}")
                async for s in get_session():
                    try:
                        await db.update_lead(s, lid, {
                            "status": "failed",
                            "error_message": str(e),
                        })
                        break
                    except Exception:
                        pass

        asyncio.create_task(run())
        started.append(lead.lead_id)

    return {
        "message": f"Started processing {len(started)} leads",
        "lead_ids": started,
    }
