from __future__ import annotations

from datetime import datetime, timezone

from src.models.lead_state import LeadState
from src.llm.provider import generate, parse_json_response
from src.llm.prompts import ENRICHMENT_PROMPT
from src.utils.logger import get_logger

logger = get_logger("graph.enrich")


async def enrich_node(state: LeadState) -> dict:
    company = state.get("company_name", "Unknown")
    logger.info(f"Enriching: {company}")

    research_context = _compile_research_context(state)

    prompt = ENRICHMENT_PROMPT.format(
        company_name=company,
        company_website=state.get("company_website", "N/A"),
        research_context=research_context,
    )

    try:
        response = await generate(
            prompt=prompt,
            system_prompt="You are a B2B sales research analyst. Always respond with valid JSON.",
            temperature=0.1,
            max_tokens=1500,
            response_format="json",
        )

        parsed = parse_json_response(response)

        updates: dict = {
            "status": "scoring",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "company_description": parsed.get("company_description"),
            "industry": parsed.get("industry"),
            "is_b2b": parsed.get("is_b2b"),
            "employee_count": parsed.get("employee_count_estimate"),
            "company_size_category": parsed.get("company_size_category"),
            "pain_points": parsed.get("pain_points", []),
            "buying_signals": parsed.get("buying_signals", []),
            "ceo_name": parsed.get("ceo_name"),
            "ceo_title": parsed.get("ceo_title"),
            "ceo_linkedin": parsed.get("ceo_linkedin"),
            "company_email": parsed.get("company_email"),
            "hr_email": parsed.get("hr_email"),
            "headquarters": parsed.get("headquarters"),
            "founded_year": parsed.get("founded_year"),
            "funding_status": parsed.get("funding_status"),
            "social_profiles": parsed.get("social_profiles"),
        }

        logger.info(
            f"Enriched {company}: industry={updates['industry']}, "
            f"b2b={updates['is_b2b']}, size={updates['company_size_category']}, "
            f"ceo={updates.get('ceo_name')}, hr_email={updates.get('hr_email')}"
        )
        return updates

    except Exception as e:
        logger.error(f"Enrichment failed for {company}: {e}")
        return {
            "status": "scoring",
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "error_message": f"Enrichment failed: {str(e)}",
        }


def _compile_research_context(state: LeadState) -> str:
    sections: list[str] = []

    content = state.get("website_content", "")
    if content:
        sections.append(f"=== WEBSITE CONTENT ===\n{content[:6000]}")

    results = state.get("search_results", [])
    if results:
        text = "\n".join(
            f"- {r.get('title', '')}: {r.get('snippet', '')} (source: {r.get('url', '')})"
            for r in results[:20]
        )
        sections.append(f"=== SEARCH RESULTS ===\n{text}")

    tech = state.get("tech_stack", [])
    if tech:
        sections.append(f"=== DETECTED TECH STACK ===\n{', '.join(tech)}")

    positions = state.get("open_positions", [])
    if positions:
        text = "\n".join(f"- {p}" for p in positions[:10])
        sections.append(f"=== OPEN POSITIONS ===\n{text}")

    news = state.get("recent_news", [])
    if news:
        if isinstance(news[0], dict):
            text = "\n".join(f"- {n.get('title', '')}: {n.get('snippet', '')}" for n in news[:5])
        else:
            text = "\n".join(f"- {n}" for n in news[:5])
        sections.append(f"=== RECENT NEWS ===\n{text}")

    return "\n\n".join(sections)[:12000]
