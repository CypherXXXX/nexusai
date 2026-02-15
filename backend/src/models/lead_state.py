from __future__ import annotations

from typing import Optional
from typing_extensions import TypedDict


class LeadState(TypedDict, total=False):
    lead_id: str
    company_name: str
    company_website: Optional[str]
    contact_name: Optional[str]
    contact_email: Optional[str]
    contact_title: Optional[str]
    source: str
    sender_name: Optional[str]

    website_content: Optional[str]
    search_results: Optional[list[dict]]
    tech_stack: Optional[list[str]]
    open_positions: Optional[list[str]]
    recent_news: Optional[list[dict]]

    company_description: Optional[str]
    industry: Optional[str]
    is_b2b: Optional[bool]
    employee_count: Optional[str]
    company_size_category: Optional[str]
    pain_points: Optional[list[str]]
    buying_signals: Optional[list[str]]
    ceo_name: Optional[str]
    ceo_title: Optional[str]
    ceo_linkedin: Optional[str]
    company_email: Optional[str]
    hr_email: Optional[str]
    headquarters: Optional[str]
    founded_year: Optional[str]
    funding_status: Optional[str]
    social_profiles: Optional[dict]

    score: int
    score_breakdown: Optional[dict]
    scoring_reasoning: Optional[str]
    confidence: float

    draft_email_subject: Optional[str]
    draft_email_body: Optional[str]
    personalization_hooks: Optional[list[str]]

    status: str
    human_review_reason: Optional[str]
    human_feedback: Optional[str]
    error_message: Optional[str]

    created_at: str
    updated_at: str
    processing_time_seconds: Optional[float]
