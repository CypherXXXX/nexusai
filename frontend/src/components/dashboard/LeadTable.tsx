"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { api } from "@/lib/api";
import { ArrowRight, Bot, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { UsageLimitModal } from "./UsageLimitModal";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function LeadTable() {
    const { data: leads, error, isLoading } = useSWR("/api/leads", fetcher, {
        refreshInterval: 5000,
    });
    const { mutate } = useSWRConfig();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [limitModalOpen, setLimitModalOpen] = useState(false);
    const { user } = useUser();

    const handleProcess = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            setProcessingId(id);
            const headers: Record<string, string> = {};
            if (user?.username) headers["X-Sender-Name"] = user.username;
            await api.post(`/api/leads/${id}/process`, {}, { headers });
            mutate("/api/leads");
        } catch (err: any) {
            if (err?.response?.status === 429) {
                setLimitModalOpen(true);
            }
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Delete this lead permanently?")) return;
        try {
            setDeletingId(id);
            await api.delete(`/api/leads/${id}`);
            mutate("/api/leads");
        } finally {
            setDeletingId(null);
        }
    };

    if (error) return <div className="text-red-500 p-4">Failed to load leads</div>;
    if (isLoading) return (
        <div className="flex items-center justify-center p-12 border border-neutral-800 rounded-xl bg-neutral-900/50">
            <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
            <span className="ml-3 text-neutral-400">Loading pipeline...</span>
        </div>
    );

    if (!leads || leads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-neutral-800 rounded-xl bg-neutral-900/30">
                <Bot className="h-10 w-10 text-neutral-600 mb-3" />
                <p className="text-neutral-400 text-sm font-medium">No leads yet</p>
                <p className="text-neutral-600 text-xs mt-1">Add a company to start AI-powered research</p>
            </div>
        );
    }

    return (
        <>
            <UsageLimitModal open={limitModalOpen} onClose={() => setLimitModalOpen(false)} />

            <div className="hidden md:block rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-neutral-800 hover:bg-transparent">
                            <TableHead className="text-neutral-400">Company</TableHead>
                            <TableHead className="text-neutral-400">Contact</TableHead>
                            <TableHead className="text-neutral-400">Status</TableHead>
                            <TableHead className="text-neutral-400">Score</TableHead>
                            <TableHead className="text-right text-neutral-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence>
                            {leads.map((lead: any, i: number) => (
                                <motion.tr
                                    key={lead.lead_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-neutral-800 hover:bg-neutral-900/80 transition-colors cursor-pointer group"
                                    onClick={() => window.location.href = `/dashboard/leads/${lead.lead_id}`}
                                >
                                    <TableCell className="font-medium text-white">
                                        <div className="flex flex-col">
                                            <span>{lead.company_name}</span>
                                            {lead.company_website && (
                                                <span className="text-xs text-neutral-500 truncate max-w-[180px]">
                                                    {lead.company_website}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-neutral-300">{lead.contact_name || "—"}</span>
                                            <span className="text-xs text-neutral-500">{lead.contact_email || ""}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={lead.status} />
                                    </TableCell>
                                    <TableCell>
                                        {lead.score > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-16 overflow-hidden rounded-full bg-neutral-800">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${lead.score >= 70 ? "bg-emerald-500" : lead.score >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                                                        style={{ width: `${lead.score}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-neutral-300">{lead.score}</span>
                                            </div>
                                        ) : (
                                            <span className="text-neutral-600 text-sm">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                            {lead.status === "new" && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-violet-400 hover:text-violet-300 hover:bg-violet-950/30"
                                                    onClick={(e) => handleProcess(lead.lead_id, e)}
                                                    disabled={!!processingId}
                                                >
                                                    {processingId === lead.lead_id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        "Research"
                                                    )}
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => handleDelete(lead.lead_id, e)}
                                                disabled={!!deletingId}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="sm" variant="ghost" asChild>
                                                <Link href={`/dashboard/leads/${lead.lead_id}`}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

            <div className="md:hidden space-y-3">
                {leads.map((lead: any, i: number) => (
                    <motion.div
                        key={lead.lead_id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Link href={`/dashboard/leads/${lead.lead_id}`}>
                            <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900/80 transition-colors space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-semibold text-white truncate">{lead.company_name}</h4>
                                        <p className="text-xs text-neutral-500 truncate">{lead.contact_name || "No contact"}</p>
                                    </div>
                                    <StatusBadge status={lead.status} />
                                </div>

                                <div className="flex items-center justify-between">
                                    {lead.score > 0 ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="h-2 flex-1 max-w-[120px] overflow-hidden rounded-full bg-neutral-800">
                                                <div
                                                    className={`h-full ${lead.score >= 70 ? "bg-emerald-500" : lead.score >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                                                    style={{ width: `${lead.score}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-neutral-300">{lead.score}/100</span>
                                        </div>
                                    ) : (
                                        <span className="text-neutral-600 text-xs">Not scored</span>
                                    )}

                                    <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                                        {lead.status === "new" && (
                                            <Button
                                                size="sm"
                                                className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8"
                                                onClick={(e) => handleProcess(lead.lead_id, e)}
                                                disabled={!!processingId}
                                            >
                                                {processingId === lead.lead_id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Research"}
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-neutral-500 hover:text-red-400 h-8 w-8 p-0"
                                            onClick={(e) => handleDelete(lead.lead_id, e)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        new: "secondary",
        researching: "outline",
        enriching: "outline",
        scoring: "outline",
        scoring_complete: "outline",
        drafting: "outline",
        drafting_complete: "outline",
        human_review: "warning",
        approved: "success",
        sent: "success",
        rejected: "destructive",
        failed: "destructive",
    };

    return (
        <Badge variant={map[status] || "secondary" as any} className="capitalize text-xs">
            {(["researching", "enriching", "scoring", "drafting"].includes(status)) && (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
            )}
            {status.replace(/_/g, " ")}
        </Badge>
    );
}
