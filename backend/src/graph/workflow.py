"""
LangGraph Workflow — wires all nodes and edges into a compiled state graph.
"""

from __future__ import annotations

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from src.models.lead_state import LeadState
from src.graph.nodes.ingest_node import ingest_node
from src.graph.nodes.research_node import research_node
from src.graph.nodes.enrich_node import enrich_node
from src.graph.nodes.scoring_node import scoring_node
from src.graph.nodes.drafting_node import drafting_node
from src.graph.nodes.review_node import review_node
from src.graph.nodes.send_node import send_node, auto_reject_node
from src.graph.edges.routing import route_after_scoring, route_after_review, route_after_drafting


def build_workflow():
    """
    Construct the complete LangGraph state machine.

    Flow:
        START → ingest → research → enrich → score
            → [conditional] →
                auto_reject → END
                draft → [conditional] →
                    send → END
                    human_review → [conditional] → draft/send/reject/re-research
    """
    workflow = StateGraph(LeadState)

    # ── Add all nodes ───────────────────────────────────────────────
    workflow.add_node("ingest", ingest_node)
    workflow.add_node("research", research_node)
    workflow.add_node("enrich", enrich_node)
    workflow.add_node("score", scoring_node)
    workflow.add_node("draft", drafting_node)
    workflow.add_node("human_review", review_node)
    workflow.add_node("send", send_node)
    workflow.add_node("auto_reject", auto_reject_node)

    # ── Linear flow: START → ingest → research → enrich → score ───
    workflow.add_edge(START, "ingest")
    workflow.add_edge("ingest", "research")
    workflow.add_edge("research", "enrich")
    workflow.add_edge("enrich", "score")

    # ── Conditional: After scoring, route to Draft or Reject ───────
    workflow.add_conditional_edges(
        "score",
        route_after_scoring,
        {
            "draft": "draft",
            "auto_reject": "auto_reject",
        },
    )

    # ── After drafting → decide to Send or Review ──────────────────
    workflow.add_conditional_edges(
        "draft",
        route_after_drafting,
        {
            "send": "send",
            "human_review": "human_review",
        },
    )

    # ── After human review → route based on decision ───────────────
    workflow.add_conditional_edges(
        "human_review",
        route_after_review,
        {
            "draft": "draft",
            "send": "send",
            "auto_reject": "auto_reject",
            "research": "research",
        },
    )

    # ── Terminal nodes ─────────────────────────────────────────────
    workflow.add_edge("send", END)
    workflow.add_edge("auto_reject", END)

    # ── Compile with in-memory checkpointer ────────────────────────
    # MemorySaver is simpler for dev; swap to SqliteSaver for prod
    checkpointer = MemorySaver()
    compiled = workflow.compile(checkpointer=checkpointer)

    return compiled


# Global workflow instance
graph = build_workflow()
