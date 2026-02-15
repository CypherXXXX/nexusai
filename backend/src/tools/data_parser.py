"""
CSV and data parsing utilities for lead import.
"""

from __future__ import annotations

import csv
import io
import uuid
from datetime import datetime, timezone
from typing import Optional

from src.utils.validators import is_valid_email, normalize_url
from src.utils.logger import get_logger

logger = get_logger("tools.data_parser")

# Standard column name mappings (CSV header → LeadState field)
COLUMN_MAPPINGS: dict[str, str] = {
    "company": "company_name",
    "company_name": "company_name",
    "company name": "company_name",
    "name": "company_name",
    "website": "company_website",
    "company_website": "company_website",
    "url": "company_website",
    "domain": "company_website",
    "contact": "contact_name",
    "contact_name": "contact_name",
    "contact name": "contact_name",
    "person": "contact_name",
    "email": "contact_email",
    "contact_email": "contact_email",
    "contact email": "contact_email",
    "title": "contact_title",
    "contact_title": "contact_title",
    "job_title": "contact_title",
    "role": "contact_title",
    "position": "contact_title",
}


def parse_csv(content: str | bytes) -> list[dict]:
    """
    Parse a CSV string/bytes into a list of lead dicts.

    Handles:
    - Various column name formats via COLUMN_MAPPINGS
    - URL normalization
    - Email validation
    - UUID generation for lead_id
    """
    if isinstance(content, bytes):
        content = content.decode("utf-8-sig")  # Handle BOM

    reader = csv.DictReader(io.StringIO(content))
    leads = []

    for row in reader:
        lead = _map_row(row)
        if lead.get("company_name"):  # Must have at least company name
            leads.append(lead)
        else:
            logger.warning(f"Skipping row with no company name: {row}")

    logger.info(f"Parsed {len(leads)} leads from CSV ({len(list(reader)) + len(leads)} total rows)")
    return leads


def _map_row(row: dict) -> dict:
    """Map a CSV row to LeadState fields using column mappings."""
    now = datetime.now(timezone.utc).isoformat()
    lead: dict = {
        "lead_id": str(uuid.uuid4()),
        "source": "csv",
        "status": "new",
        "score": 0,
        "confidence": 0.0,
        "created_at": now,
        "updated_at": now,
    }

    for csv_col, value in row.items():
        if not value or not value.strip():
            continue

        mapped_field = COLUMN_MAPPINGS.get(csv_col.lower().strip())
        if mapped_field:
            cleaned = value.strip()

            # Normalize URLs
            if mapped_field == "company_website":
                cleaned = normalize_url(cleaned)

            # Validate emails (keep even if invalid, just log)
            if mapped_field == "contact_email" and not is_valid_email(cleaned):
                logger.warning(f"Possibly invalid email: {cleaned}")

            lead[mapped_field] = cleaned

    return lead
