"""
Review Node — the "Pause Button".
Pauses graph execution for human review using LangGraph's interrupt().
"""

from __future__ import annotations

from datetime import datetime, timezone
from langgraph.types import interrupt

from src.models.lead_state import LeadState
from src.utils.logger import get_logger

logger = get_logger("graph.review")


async def review_node(state: LeadState) -> dict:
    """
    Pause the pipeline for human review.

    Uses LangGraph's interrupt() to checkpoint state and wait for
    human input via the dashboard. The graph resumes when the API
    endpoint calls graph.invoke() with a Command(resume=...).
    """
    company = state.get("company_name", "Unknown")
    logger.info(f"Pausing for human review: {company} (score: {state.get('score', 0)})")

    # This call PAUSES execution — the graph won't proceed until
    # a human submits a decision through the dashboard API
    human_decision = interrupt({
        "lead_id": state.get("lead_id"),
        "company_name": company,
        "score": state.get("score", 0),
        "confidence": state.get("confidence", 0.0),
        "reason_for_review": state.get("human_review_reason", ""),
        "scoring_breakdown": state.get("score_breakdown"),
        "draft_email_subject": state.get("draft_email_subject"),
        "draft_email_body": state.get("draft_email_body"),
        "message": "Please review this lead and approve or reject.",
    })

    # === Execution resumes here after human input ===
    action = human_decision.get("action", "reject")
    logger.info(f"Human decision for {company}: {action}")

    updates: dict = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "human_feedback": human_decision.get("feedback", ""),
    }

    if action == "approve":
        updates["status"] = "approved"
        # Allow human to edit the email before sending
        if human_decision.get("edited_email_body"):
            updates["draft_email_body"] = human_decision["edited_email_body"]
        if human_decision.get("edited_email_subject"):
            updates["draft_email_subject"] = human_decision["edited_email_subject"]
    elif action == "reject":
        updates["status"] = "rejected"
    elif action == "rescore":
        updates["status"] = "new"  # Re-enter the pipeline from research
    else:
        updates["status"] = "rejected"

    return updates
