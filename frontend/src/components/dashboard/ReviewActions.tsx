"use client";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Check, X, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { toast } from "sonner"; // Assuming sonner is installed or will be used, simple console log fallback for now

interface ReviewActionsProps {
    leadId: string;
    status: string;
    onActionComplete?: () => void;
}

export function ReviewActions({ leadId, status, onActionComplete }: ReviewActionsProps) {
    const [loading, setLoading] = useState(false);
    const { mutate } = useSWRConfig();

    const handleAction = async (action: "approve" | "reject" | "process") => {
        setLoading(true);
        try {
            if (action === "process") {
                await api.post(`/api/leads/${leadId}/process`);
            } else {
                await api.post(`/api/review/${leadId}/${action}`, { action });
            }
            mutate(`/api/leads/${leadId}`);
            mutate("/api/leads"); // Update list too
            if (onActionComplete) onActionComplete();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "approved" || status === "sent" || status === "rejected") {
        return null;
    }

    return (
        <div className="flex gap-2">
            {status === "new" && (
                <Button size="sm" variant="ghost" onClick={() => handleAction("process")} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                    Research
                </Button>
            )}

            {(status === "human_review" || status === "scoring_complete" || status === "drafting_complete") && (
                <>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAction("reject")}
                        disabled={loading}
                    >
                        <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleAction("approve")}
                        disabled={loading}
                    >
                        <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                </>
            )}
        </div>
    );
}
