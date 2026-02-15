"""
Conditional edge routing logic — the "Decision Maker".
Determines whether a lead is auto-qualified, needs review, or gets rejected.
"""

from __future__ import annotations

from config.settings import QUALIFICATION_THRESHOLD, AUTO_REJECT_THRESHOLD
from src.models.lead_state import LeadState
from src.utils.logger import get_logger

logger = get_logger("graph.routing")


def route_after_scoring(state: LeadState) -> str:
    """
    Route lead after scoring.
    
    New Logic:
    - Auto-reject low scores.
    - EVERYTHING else goes to "draft" first. 
      (We want a draft ready even if it needs human review later).
    """
    score = state.get("score", 0)
    company = state.get("company_name", "Unknown")

    # CASE 1: Auto-reject
    if score < AUTO_REJECT_THRESHOLD:
        logger.info(f"Routing {company}: AUTO-REJECT (score={score})")
        return "auto_reject"

    # CASE 2: Send to Drafting (for both Auto-Qualify and Review cases)
    # We'll decide whether to stop for review AFTER the draft is made.
    logger.info(f"Routing {company}: DRAFTING (score={score})")
    return "draft"


def route_after_drafting(state: LeadState) -> str:
    """
    Decide what to do after a draft is generated.
    """
    score = state.get("score", 0)
    confidence = state.get("confidence", 0.0)
    company = state.get("company_name", "Unknown")

    # High confidence -> Auto-send (skipped for now, we'll route to end or send node)
    # actually, purely based on confidence
    if score >= QUALIFICATION_THRESHOLD and confidence >= 0.7:
        logger.info(f"Routing {company}: AUTO-SEND (High confidence)")
        return "send"  # Or "human_review" if you want to force review for everyone initially
    
    # Low confidence / Borderline -> Human Review
    logger.info(f"Routing {company}: HUMAN REVIEW (Draft ready)")
    return "human_review"


def route_after_review(state: LeadState) -> str:
    """
    Route based on human review decision.

    Returns:
        - "draft"       → Approved, needs email draft
        - "send"        → Approved, draft already exists
        - "auto_reject" → Rejected
        - "research"    → Human wants re-research
    """
    status = state.get("status", "")
    company = state.get("company_name", "Unknown")

    if status == "approved":
        if state.get("draft_email_body"):
            logger.info(f"Post-review {company}: SEND (draft exists)")
            return "send"
        else:
            logger.info(f"Post-review {company}: DRAFT (no draft yet)")
            return "draft"
    elif status == "new":  # Rescore requested
        logger.info(f"Post-review {company}: RE-RESEARCH")
        return "research"
    else:
        logger.info(f"Post-review {company}: REJECTED")
        return "auto_reject"


def get_human_review_reason(state: LeadState) -> str:
    """Generate a human-readable explanation for why review is needed."""
    score = state.get("score", 0)
    confidence = state.get("confidence", 0.0)
    breakdown = state.get("score_breakdown", {})

    if score >= QUALIFICATION_THRESHOLD and confidence < 0.7:
        return (
            f"Score is {score} (qualified) but confidence is only "
            f"{confidence:.0%}. Research data may be incomplete."
        )

    weak = _identify_weak_criteria(breakdown)
    if score >= AUTO_REJECT_THRESHOLD:
        return (
            f"Borderline score of {score}/100. "
            f"Key gaps: {weak}"
        )

    return f"Low score of {score}/100. Likely not a fit."


def _identify_weak_criteria(breakdown: dict) -> str:
    """Find criteria that scored poorly to explain to human reviewer."""
    if not breakdown:
        return "No scoring data available"

    weak = []
    for name, data in breakdown.items():
        if isinstance(data, dict):
            pct = data.get("score", 0) / data.get("max", 1) if data.get("max") else 0
            if pct < 0.5:
                weak.append(f"{name} ({data.get('score', 0)}/{data.get('max', 0)})")

    return ", ".join(weak) if weak else "All criteria scored above 50%"
