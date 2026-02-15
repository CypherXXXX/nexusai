"""
Pydantic models for the scoring rubric system.
"""

from pydantic import BaseModel, Field


class ScoringCriterion(BaseModel):
    """A single scoring criterion within the rubric."""
    name: str
    description: str
    max_points: int = Field(ge=0, le=100)
    evaluation_prompt: str


class ScoringRubric(BaseModel):
    """Complete scoring rubric configuration."""
    qualification_threshold: int = 70
    auto_reject_threshold: int = 20
    criteria: list[ScoringCriterion] = []

    @property
    def max_total_score(self) -> int:
        return sum(c.max_points for c in self.criteria)
