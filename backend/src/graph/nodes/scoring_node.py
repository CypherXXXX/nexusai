from __future__ import annotations

from datetime import datetime, timezone

from src.models.lead_state import LeadState
from src.llm.provider import generate, parse_json_response
from src.llm.prompts import SCORING_PROMPT
from config.settings import load_scoring_rubric
from src.utils.logger import get_logger

logger = get_logger("graph.scoring")


async def scoring_node(state: LeadState) -> dict:
    company = state.get("company_name", "Unknown")
    logger.info(f"Scoring: {company}")

    rubric = load_scoring_rubric()
    criteria = rubric.get("criteria", [])

    score_breakdown: dict = {}
    total_score = 0
    reasoning_parts: list[str] = []
    confidence_signals: list[float] = []

    for criterion in criteria:
        prompt = SCORING_PROMPT.format(
            company_name=company,
            company_description=state.get("company_description", "Unknown"),
            industry=state.get("industry", "Unknown"),
            is_b2b=state.get("is_b2b", "Unknown"),
            employee_count=state.get("employee_count", "Unknown"),
            tech_stack=", ".join(state.get("tech_stack", []) or []),
            buying_signals=", ".join(state.get("buying_signals", []) or []),
            pain_points=", ".join(state.get("pain_points", []) or []),
            criterion_name=criterion["name"],
            criterion_description=criterion["description"],
            max_points=criterion["max_points"],
            evaluation_prompt=criterion["evaluation_prompt"],
        )

        try:
            response = await generate(
                prompt=prompt,
                system_prompt="You are a precise lead scoring engine. Respond only with valid JSON.",
                temperature=0.0,
                max_tokens=200,
                response_format="json",
            )

            parsed = parse_json_response(response)
            criterion_score = min(
                int(parsed.get("score", 0)),
                criterion["max_points"],
            )
            criterion_confidence = float(parsed.get("confidence", 0.5))

            score_breakdown[criterion["name"]] = {
                "score": criterion_score,
                "max": criterion["max_points"],
                "reasoning": parsed.get("reasoning", ""),
                "confidence": criterion_confidence,
                "evidence": parsed.get("evidence", ""),
            }

            total_score += criterion_score
            confidence_signals.append(criterion_confidence)
            reasoning_parts.append(
                f"{criterion['name']}: {criterion_score}/{criterion['max_points']} "
                f"— {parsed.get('reasoning', 'N/A')}"
            )

        except Exception as e:
            logger.warning(f"Scoring failed for criterion {criterion['name']}: {e}")
            score_breakdown[criterion["name"]] = {
                "score": 0,
                "max": criterion["max_points"],
                "reasoning": f"Error: {str(e)}",
                "confidence": 0.0,
                "evidence": "scoring failed",
            }
            confidence_signals.append(0.0)

    avg_confidence = (
        sum(confidence_signals) / len(confidence_signals)
        if confidence_signals
        else 0.0
    )

    data_completeness = sum([
        1 if state.get("company_description") else 0,
        1 if state.get("industry") else 0,
        1 if state.get("employee_count") else 0,
        1 if state.get("tech_stack") else 0,
        1 if state.get("buying_signals") else 0,
    ]) / 5.0

    final_confidence = avg_confidence * 0.7 + data_completeness * 0.3

    updates = {
        "status": "scoring_complete",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "score": total_score,
        "score_breakdown": score_breakdown,
        "scoring_reasoning": "\n".join(reasoning_parts),
        "confidence": round(final_confidence, 2),
    }

    logger.info(
        f"Scored {company}: {total_score}/100 "
        f"(confidence: {final_confidence:.0%})"
    )
    return updates
