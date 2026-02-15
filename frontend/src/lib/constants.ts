export const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    new: { label: "New", color: "#9ca3af", bgColor: "rgba(156, 163, 175, 0.15)" },
    researching: { label: "Researching", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.15)" },
    enriching: { label: "Enriching", color: "#8b5cf6", bgColor: "rgba(139, 92, 246, 0.15)" },
    scoring: { label: "Scoring", color: "#a855f7", bgColor: "rgba(168, 85, 247, 0.15)" },
    scoring_complete: { label: "Scored", color: "#06b6d4", bgColor: "rgba(6, 182, 212, 0.15)" },
    drafting: { label: "Drafting", color: "#14b8a6", bgColor: "rgba(20, 184, 166, 0.15)" },
    drafting_complete: { label: "Drafted", color: "#06b6d4", bgColor: "rgba(6, 182, 212, 0.15)" },
    human_review: { label: "Needs Review", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.15)" },
    approved: { label: "Approved", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.15)" },
    rejected: { label: "Rejected", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.15)" },
    sent: { label: "Sent", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.15)" },
    failed: { label: "Failed", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.15)" },
};

export function getScoreColor(score: number): string {
    if (score >= 70) return "#22c55e";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
}

export function getScoreLabel(score: number): string {
    if (score >= 70) return "Qualified";
    if (score >= 40) return "Borderline";
    return "Low";
}
