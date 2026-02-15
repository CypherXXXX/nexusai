from __future__ import annotations

from datetime import datetime, timezone

from src.models.lead_state import LeadState
from src.llm.provider import generate, parse_json_response
from src.llm.prompts import DRAFTING_PROMPT
from src.utils.logger import get_logger

logger = get_logger("graph.drafting")


async def drafting_node(state: LeadState) -> dict:
    company = state.get("company_name", "Unknown")
    logger.info(f"Drafting email for: {company}")

    hooks = _build_personalization_hooks(state)
    sender_name = state.get("sender_name") or "NexusAI Team"
    hr_email = state.get("hr_email") or state.get("company_email") or ""

    prompt = DRAFTING_PROMPT.format(
        company_name=company,
        contact_name=state.get("contact_name", "there"),
        contact_title=state.get("contact_title", "HR Manager"),
        industry=state.get("industry", "technology"),
        company_description=state.get("company_description", "a growing company"),
        hr_email=hr_email or "not available",
        sender_name=sender_name,
        personalization_hooks="\n".join(f"- {h}" for h in hooks),
        pain_points="\n".join(
            f"- {pp}" for pp in (state.get("pain_points") or ["improving efficiency"])
        ),
        buying_signals="\n".join(
            f"- {bs}" for bs in (state.get("buying_signals") or ["growth"])
        ),
    )

    try:
        response = await generate(
            prompt=prompt,
            system_prompt="You are an expert B2B sales copywriter. Respond only with valid JSON.",
            temperature=0.7,
            max_tokens=1000,
            response_format="json",
        )

        parsed = parse_json_response(response)

        updates = {
            "status": "drafting_complete",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "draft_email_subject": parsed.get("subject", ""),
            "draft_email_body": parsed.get("body", ""),
            "personalization_hooks": hooks,
        }

        logger.info(f"Email drafted for {company}: {updates['draft_email_subject']}")
        return updates

    except Exception as e:
        logger.error(f"Drafting failed for {company}: {e}")
        return {
            "status": "drafting_complete",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "error_message": f"Email drafting failed: {str(e)}",
            "draft_email_subject": "",
            "draft_email_body": "",
        }


def _build_personalization_hooks(state: LeadState) -> list[str]:
    hooks: list[str] = []

    tech = state.get("tech_stack") or []
    if tech:
        hooks.append(f"They use {', '.join(tech[:4])} in their tech stack")

    positions = state.get("open_positions") or []
    if positions:
        hooks.append(f"Currently hiring for: {', '.join(positions[:3])}")

    ceo = state.get("ceo_name")
    if ceo:
        title = state.get("ceo_title", "CEO")
        hooks.append(f"Led by {ceo} ({title})")

    funding = state.get("funding_status")
    if funding:
        hooks.append(f"Funding stage: {funding}")

    hq = state.get("headquarters")
    if hq:
        hooks.append(f"Headquartered in {hq}")

    founded = state.get("founded_year")
    if founded:
        hooks.append(f"Founded in {founded}")

    news = state.get("recent_news") or []
    if news:
        first = news[0] if isinstance(news[0], dict) else {"title": str(news[0])}
        hooks.append(f"Recent news: {first.get('title', '')}")

    emp = state.get("employee_count")
    if emp:
        hooks.append(f"Company size: ~{emp} employees")

    signals = state.get("buying_signals") or []
    if signals:
        hooks.append(f"Buying signal: {signals[0]}")

    industry = state.get("industry")
    if industry:
        hooks.append(f"Operates in {industry}")

    hr = state.get("hr_email")
    if hr:
        hooks.append(f"HR contact: {hr}")

    return hooks if hooks else ["Growing company in their space"]
