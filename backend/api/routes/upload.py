from __future__ import annotations

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.connection import get_session
from src.database import operations as db
from src.tools.data_parser import parse_csv
from src.utils.logger import get_logger

logger = get_logger("api.upload")
router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("/csv")
async def upload_csv(
    request: Request,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
):
    if not file.filename or not file.filename.endswith(".csv"):
        return {"error": "Please upload a CSV file"}

    user_id = request.headers.get("X-User-Id", "default")
    usage = await db.get_daily_usage(session, user_id)
    if usage.csv_count >= 5:
        raise HTTPException(
            status_code=429,
            detail="Daily CSV upload limit reached (5/day on Free tier). Upgrade to Pro for 25 uploads/day."
        )

    await db.increment_csv_count(session, user_id)

    content = await file.read()
    leads = parse_csv(content)

    created = []
    skipped = []

    for lead_data in leads:
        try:
            record = await db.create_lead(session, lead_data)
            created.append(record.lead_id)
        except Exception as e:
            logger.warning(f"Skipping lead {lead_data.get('company_name')}: {e}")
            skipped.append({
                "company_name": lead_data.get("company_name", "Unknown"),
                "reason": str(e),
            })

    logger.info(f"CSV upload: {len(created)} created, {len(skipped)} skipped")

    return {
        "message": f"Imported {len(created)} leads",
        "created_count": len(created),
        "skipped_count": len(skipped),
        "created_ids": created,
        "skipped": skipped,
    }
