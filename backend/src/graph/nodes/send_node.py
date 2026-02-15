"""
Send Node — dispatches the final email via Gmail SMTP.
Auto-Reject Node — marks low-score leads as rejected.
"""

from __future__ import annotations

from datetime import datetime, timezone

from src.models.lead_state import LeadState
from src.tools.email_sender import send_email
from src.utils.logger import get_logger

logger = get_logger("graph.send")


async def send_node(state: LeadState) -> dict:
    """Send the drafted email and update status."""
    company = state.get("company_name", "Unknown")
    contact_email = state.get("contact_email", "")
    subject = state.get("draft_email_subject", "")
    body = state.get("draft_email_body", "")

    logger.info(f"Sending email to {contact_email} for {company}")

    updates: dict = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    if not contact_email:
        updates["status"] = "failed"
        updates["error_message"] = "No contact email available"
        logger.warning(f"No email for {company} — cannot send")
        return updates

    if not subject or not body:
        updates["status"] = "failed"
        updates["error_message"] = "No email draft available"
        logger.warning(f"No draft for {company} — cannot send")
        return updates

    try:
        success = await send_email(
            to_email=contact_email,
            subject=subject,
            body=body,
        )
        if success:
            updates["status"] = "sent"
            logger.info(f"Email sent to {contact_email} for {company}")
        else:
            updates["status"] = "failed"
            updates["error_message"] = "Email sending returned failure"
    except Exception as e:
        updates["status"] = "failed"
        updates["error_message"] = str(e)
        logger.error(f"Email send failed for {company}: {e}")

    return updates


async def auto_reject_node(state: LeadState) -> dict:
    """Auto-reject leads that scored below the threshold."""
    company = state.get("company_name", "Unknown")
    score = state.get("score", 0)
    logger.info(f"Auto-rejecting {company} (score: {score})")

    return {
        "status": "rejected",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "human_review_reason": (
            f"Auto-rejected: Score {score}/100 is below minimum threshold."
        ),
    }
