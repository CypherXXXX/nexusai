from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, JSON,
    create_engine,
)
from sqlalchemy.orm import DeclarativeBase, Session


class Base(DeclarativeBase):
    pass


class LeadRecord(Base):
    __tablename__ = "leads"

    lead_id = Column(String, primary_key=True)

    company_name = Column(String, nullable=False, index=True)
    company_website = Column(String, nullable=True)
    contact_name = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_title = Column(String, nullable=True)
    source = Column(String, default="manual")

    website_content = Column(Text, nullable=True)
    search_results = Column(JSON, nullable=True)
    tech_stack = Column(JSON, nullable=True)
    open_positions = Column(JSON, nullable=True)
    recent_news = Column(JSON, nullable=True)

    company_description = Column(Text, nullable=True)
    industry = Column(String, nullable=True)
    is_b2b = Column(Boolean, nullable=True)
    employee_count = Column(String, nullable=True)
    company_size_category = Column(String, nullable=True)
    pain_points = Column(JSON, nullable=True)
    buying_signals = Column(JSON, nullable=True)
    ceo_name = Column(String, nullable=True)
    ceo_title = Column(String, nullable=True)
    ceo_linkedin = Column(String, nullable=True)
    company_email = Column(String, nullable=True)
    hr_email = Column(String, nullable=True)
    headquarters = Column(String, nullable=True)
    founded_year = Column(String, nullable=True)
    funding_status = Column(String, nullable=True)
    social_profiles = Column(JSON, nullable=True)

    score = Column(Integer, default=0)
    score_breakdown = Column(JSON, nullable=True)
    scoring_reasoning = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)

    draft_email_subject = Column(String, nullable=True)
    draft_email_body = Column(Text, nullable=True)
    personalization_hooks = Column(JSON, nullable=True)

    status = Column(String, default="new", index=True)
    human_review_reason = Column(Text, nullable=True)
    human_feedback = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    processing_time_seconds = Column(Float, nullable=True)

    def to_dict(self) -> dict:
        return {
            "lead_id": self.lead_id,
            "company_name": self.company_name,
            "company_website": self.company_website,
            "contact_name": self.contact_name,
            "contact_email": self.contact_email,
            "contact_title": self.contact_title,
            "source": self.source,
            "website_content": self.website_content,
            "search_results": self.search_results,
            "tech_stack": self.tech_stack,
            "open_positions": self.open_positions,
            "recent_news": self.recent_news,
            "company_description": self.company_description,
            "industry": self.industry,
            "is_b2b": self.is_b2b,
            "employee_count": self.employee_count,
            "company_size_category": self.company_size_category,
            "pain_points": self.pain_points,
            "buying_signals": self.buying_signals,
            "ceo_name": self.ceo_name,
            "ceo_title": self.ceo_title,
            "ceo_linkedin": self.ceo_linkedin,
            "company_email": self.company_email,
            "hr_email": self.hr_email,
            "headquarters": self.headquarters,
            "founded_year": self.founded_year,
            "funding_status": self.funding_status,
            "social_profiles": self.social_profiles,
            "score": self.score,
            "score_breakdown": self.score_breakdown,
            "scoring_reasoning": self.scoring_reasoning,
            "confidence": self.confidence,
            "draft_email_subject": self.draft_email_subject,
            "draft_email_body": self.draft_email_body,
            "personalization_hooks": self.personalization_hooks,
            "status": self.status,
            "human_review_reason": self.human_review_reason,
            "human_feedback": self.human_feedback,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "processing_time_seconds": self.processing_time_seconds,
        }


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lead_id = Column(String, index=True, nullable=False)
    to_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    status = Column(String, default="sent")
    error = Column(Text, nullable=True)
    sent_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )


class UserUsage(Base):
    __tablename__ = "user_usage"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False, index=True, default="default")
    date = Column(String, nullable=False, index=True)
    search_count = Column(Integer, default=0)
    csv_count = Column(Integer, default=0)

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "date": self.date,
            "search_count": self.search_count,
            "csv_count": self.csv_count,
        }
