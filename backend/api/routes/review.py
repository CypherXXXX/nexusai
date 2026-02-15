"""
Human review API routes — approve, reject, or rescore leads.
"""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_session
from src.database import operations as db
from src.utils.logger import get_logger

logger = get_logger("api.review")
router = APIRouter(prefix="/api/review", tags=["review"])


class ReviewDecision(BaseModel):
    action: str  # "approve" | "reject" | "rescore"
    feedback: Optional[str] = None
    edited_email_subject: Optional[str] = None
    edited_email_body: Optional[str] = None


@router.get("/queue")
async def get_review_queue(
    session: AsyncSession = Depends(get_session),
):
    """Get all leads awaiting human review."""
    records = await db.get_review_queue(session)
    return [r.to_dict() for r in records]


@router.post("/{lead_id}/approve")
async def approve_lead(
    lead_id: str,
    decision: ReviewDecision = ReviewDecision(action="approve"),
    session: AsyncSession = Depends(get_session),
):
    """Approve a lead, optionally editing the email."""
    record = await db.get_lead(session, lead_id)
    if not record:
        raise HTTPException(status_code=404, detail="Lead not found")

    updates = {
        "status": "approved",
        "human_feedback": decision.feedback or "Approved by human reviewer",
    }

    if decision.edited_email_subject:
        updates["draft_email_subject"] = decision.edited_email_subject
    if decision.edited_email_body:
        updates["draft_email_body"] = decision.edited_email_body

    await db.update_lead(session, lead_id, updates)
    logger.info(f"Lead {lead_id} approved")

    return {"message": "Lead approved", "lead_id": lead_id}


@router.post("/{lead_id}/reject")
async def reject_lead(
    lead_id: str,
    decision: ReviewDecision = ReviewDecision(action="reject"),
    session: AsyncSession = Depends(get_session),
):
    """Reject a lead."""
    record = await db.get_lead(session, lead_id)
    if not record:
        raise HTTPException(status_code=404, detail="Lead not found")

    await db.update_lead(session, lead_id, {
        "status": "rejected",
        "human_feedback": decision.feedback or "Rejected by human reviewer",
    })
    logger.info(f"Lead {lead_id} rejected")

    return {"message": "Lead rejected", "lead_id": lead_id}


@router.post("/{lead_id}/rescore")
async def rescore_lead(
    lead_id: str,
    decision: ReviewDecision = ReviewDecision(action="rescore"),
    session: AsyncSession = Depends(get_session),
):
    """Send a lead back through the research pipeline."""
    record = await db.get_lead(session, lead_id)
    if not record:
        raise HTTPException(status_code=404, detail="Lead not found")

    await db.update_lead(session, lead_id, {
        "status": "new",
        "human_feedback": decision.feedback or "Rescore requested",
        "score": 0,
        "confidence": 0.0,
    })
    logger.info(f"Lead {lead_id} sent for re-research")

    return {"message": "Lead queued for re-research", "lead_id": lead_id}
