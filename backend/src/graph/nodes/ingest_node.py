"""
Ingest Node — validates and prepares incoming lead data.
First node in the pipeline.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from src.models.lead_state import LeadState
from src.utils.validators import normalize_url, is_valid_email
from src.utils.logger import get_logger

logger = get_logger("graph.ingest")


async def ingest_node(state: LeadState) -> dict:
    """
    Validate and normalize incoming lead data.
    Generates a lead_id if not present, normalizes URLs, sets initial status.
    """
    logger.info(f"Ingesting lead: {state.get('company_name', 'Unknown')}")

    updates: dict = {
        "status": "researching",
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    # Generate ID if not present
    if not state.get("lead_id"):
        updates["lead_id"] = str(uuid.uuid4())

    # Set defaults
    if not state.get("source"):
        updates["source"] = "manual"
    if not state.get("created_at"):
        updates["created_at"] = datetime.now(timezone.utc).isoformat()

    # Normalize website URL
    website = state.get("company_website", "")
    if website:
        updates["company_website"] = normalize_url(website)

    # Validate contact email
    email = state.get("contact_email", "")
    if email and not is_valid_email(email):
        logger.warning(f"Possibly invalid contact email: {email}")

    logger.info(
        f"Lead ingested: {state.get('company_name')} "
        f"(id={updates.get('lead_id', state.get('lead_id'))})"
    )

    return updates
