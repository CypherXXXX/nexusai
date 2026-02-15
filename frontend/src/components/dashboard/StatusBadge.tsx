"use client";

import { Badge } from "@/components/ui/Badge";
import { STATUS_CONFIG } from "@/lib/constants";

interface StatusBadgeProps {
    status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] || { label: status, color: "#9ca3af", bgColor: "rgba(156, 163, 175, 0.15)" };

    // Map our config colors to Badge variants/styles if possible, or use custom style
    let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "secondary";

    // Simple mapping logic
    if (["approved", "sent"].includes(status)) variant = "success";
    if (["rejected", "failed"].includes(status)) variant = "destructive";
    if (["human_review"].includes(status)) variant = "warning";
    if (["new", "researching", "enriching", "scoring", "drafting"].includes(status)) variant = "secondary";

    return (
        <Badge variant={variant} className="capitalize">
            {config.label}
        </Badge>
    );
}
