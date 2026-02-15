"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { api } from "@/lib/api";
import {
    ArrowLeft, Bot, Check, ExternalLink, Mail, X, AlertTriangle,
    Briefcase, Zap, Target, Newspaper, Sparkles, Globe, User,
    MapPin, Calendar, TrendingUp, Linkedin, Copy, CheckCheck, Info
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { UsageLimitModal } from "@/components/dashboard/UsageLimitModal";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } },
};

export default function LeadDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { mutate } = useSWRConfig();
    const { data: lead, error, isLoading } = useSWR(id ? `/api/leads/${id}` : null, fetcher);
    const [processing, setProcessing] = useState(false);
    const [copied, setCopied] = useState(false);
    const [hoveredBar, setHoveredBar] = useState<string | null>(null);
    const [limitModalOpen, setLimitModalOpen] = useState(false);
    const { user } = useUser();

    useSWR(
        lead?.status === "researching" || lead?.status === "enriching" || lead?.status === "scoring" || lead?.status === "scoring_complete" || lead?.status === "drafting"
            ? `/api/leads/${id}` : null,
        fetcher,
        { refreshInterval: 2000 }
    );

    const handleAction = async (action: "process" | "approve" | "reject") => {
        try {
            setProcessing(true);
            const headers: Record<string, string> = {};
            if (user?.username) headers["X-Sender-Name"] = user.username;

            if (action === "process") {
                await api.post(`/api/leads/${id}/process`, {}, { headers });
            } else if (action === "approve") {
                await api.post(`/api/review/${id}/approve`, { action: "approve" });
            } else if (action === "reject") {
                await api.post(`/api/review/${id}/reject`, { action: "reject" });
            }
            mutate(`/api/leads/${id}`);
        } catch (err: any) {
            if (err?.response?.status === 429) {
                setLimitModalOpen(true);
            }
        } finally {
            setProcessing(false);
        }
    };

    const copyEmail = () => {
        if (lead?.draft_email_body) {
            navigator.clipboard.writeText(`Subject: ${lead.draft_email_subject}\n\n${lead.draft_email_body}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
    );

    if (error || !lead) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-neutral-400">
            <AlertTriangle className="h-12 w-12 mb-4 text-red-500" />
            <h2 className="text-xl font-bold text-white">Lead Not Found</h2>
            <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Go Back</Button>
        </div>
    );

    const isProcessing = ["researching", "enriching", "scoring", "scoring_complete", "drafting"].includes(lead.status);
    const emailTarget = lead.hr_email || lead.company_email || lead.contact_email;
    const hasContactEmail = !!(lead.hr_email || lead.company_email);

    return (
        <motion.div
            className="space-y-6 max-w-6xl mx-auto pb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <UsageLimitModal open={limitModalOpen} onClose={() => setLimitModalOpen(false)} />
            <motion.div variants={itemVariants}>
                <Button variant="ghost" className="pl-0 text-neutral-400 hover:text-white mb-2" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Leads
                </Button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 p-4 md:p-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-xl">
                    <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
                                {lead.company_name}
                            </h1>
                            <Badge
                                variant={lead.status === "approved" || lead.status === "sent" ? "default" : lead.status === "rejected" ? "destructive" : "outline"}
                                className="text-sm px-3 py-1 capitalize"
                            >
                                {lead.status.replace(/_/g, " ")}
                            </Badge>
                            {isProcessing && (
                                <div className="flex items-center gap-2 text-violet-400 text-sm">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-violet-400" />
                                    Processing...
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-400 text-sm">
                            {lead.company_website && (
                                <a href={lead.company_website} target="_blank" rel="noreferrer" className="flex items-center hover:text-violet-400 transition-colors">
                                    <Globe className="mr-1.5 h-3.5 w-3.5" /> Website
                                </a>
                            )}
                            {emailTarget && (
                                <span className="flex items-center">
                                    <Mail className="mr-1.5 h-3.5 w-3.5" /> {emailTarget}
                                </span>
                            )}
                            {lead.industry && (
                                <span className="flex items-center">
                                    <Briefcase className="mr-1.5 h-3.5 w-3.5" /> {lead.industry}
                                </span>
                            )}
                            {lead.headquarters && (
                                <span className="flex items-center">
                                    <MapPin className="mr-1.5 h-3.5 w-3.5" /> {lead.headquarters}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 flex-shrink-0">
                        {lead.status === "new" && (
                            <Button onClick={() => handleAction("process")} disabled={processing} size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/20 text-white">
                                <Bot className="mr-2 h-5 w-5" /> Research Company
                            </Button>
                        )}
                        {(lead.status === "human_review" || lead.status === "drafting_complete") && (
                            <>
                                <Button onClick={() => handleAction("reject")} variant="destructive" size="lg" disabled={processing}>
                                    <X className="mr-2 h-4 w-4" /> Reject
                                </Button>
                                <Button onClick={() => handleAction("approve")} size="lg" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <Check className="mr-2 h-4 w-4" /> Approve & Send
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">

                    {lead.ceo_name && (
                        <motion.div variants={itemVariants}>
                            <Card className="border-neutral-800 bg-neutral-900/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
                                        <User className="h-4 w-4 text-violet-400" /> Company Leadership
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                            {lead.ceo_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-lg font-semibold text-white">{lead.ceo_name}</p>
                                            <p className="text-sm text-neutral-400">{lead.ceo_title || "CEO / Founder"}</p>
                                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                {lead.ceo_linkedin && (
                                                    <a href={lead.ceo_linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                                        <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                                                    </a>
                                                )}
                                                {lead.hr_email && (
                                                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                                                        <Mail className="h-3.5 w-3.5" /> {lead.hr_email}
                                                    </span>
                                                )}
                                                {lead.company_email && (
                                                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                                                        <Mail className="h-3.5 w-3.5" /> {lead.company_email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    <motion.div variants={itemVariants}>
                        <Card className="border-neutral-800 bg-neutral-900/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-violet-400" />
                                    AI Research Intelligence
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-neutral-300 leading-relaxed">
                                    {lead.company_description || "No description available yet. Click 'Research Company' to generate insights."}
                                </p>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {lead.pain_points && lead.pain_points.length > 0 && (
                                        <div className="bg-amber-950/10 border border-amber-900/20 rounded-xl p-4">
                                            <h4 className="font-semibold text-amber-500 mb-3 flex items-center gap-2 text-sm">
                                                <AlertTriangle className="h-4 w-4" /> Pain Points
                                            </h4>
                                            <ul className="space-y-2">
                                                {lead.pain_points.map((p: string, i: number) => (
                                                    <li key={i} className="text-amber-200/80 text-sm flex items-start gap-2">
                                                        <span className="mt-1.5 h-1 w-1 rounded-full bg-amber-500 shrink-0" />
                                                        {p}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {lead.buying_signals && lead.buying_signals.length > 0 && (
                                        <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-xl p-4">
                                            <h4 className="font-semibold text-emerald-500 mb-3 flex items-center gap-2 text-sm">
                                                <Zap className="h-4 w-4" /> Buying Signals
                                            </h4>
                                            <ul className="space-y-2">
                                                {lead.buying_signals.map((s: string, i: number) => (
                                                    <li key={i} className="text-emerald-200/80 text-sm flex items-start gap-2">
                                                        <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {lead.recent_news && lead.recent_news.length > 0 && (
                                    <div className="pt-4 border-t border-neutral-800">
                                        <h4 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
                                            <Newspaper className="h-4 w-4 text-blue-400" /> Recent News
                                        </h4>
                                        <div className="space-y-3">
                                            {lead.recent_news.slice(0, 3).map((item: any, i: number) => {
                                                const title = typeof item === "string" ? item : item.title;
                                                const url = typeof item === "string" ? null : item.url;
                                                const snippet = typeof item === "string" ? null : item.snippet;
                                                const source = typeof item === "string" ? null : item.source;
                                                return (
                                                    <a
                                                        key={i}
                                                        href={url || "#"}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={`block p-4 rounded-lg border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 transition-all group ${!url && "pointer-events-none"}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h5 className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">
                                                                {title}
                                                            </h5>
                                                            {url && <ExternalLink className="h-3.5 w-3.5 text-neutral-500 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-0.5" />}
                                                        </div>
                                                        {snippet && (
                                                            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{snippet}</p>
                                                        )}
                                                        {source && (
                                                            <p className="text-xs text-neutral-600 mt-2">{source}</p>
                                                        )}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="border-neutral-800 bg-neutral-900/50">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-purple-400" />
                                    AI-Generated Email Draft
                                </CardTitle>
                                {lead.draft_email_subject && (
                                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-xs">
                                        Ready for Review
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent>
                                {!hasContactEmail && lead.status !== "new" && !isProcessing ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-neutral-500 border-2 border-dashed border-amber-800/40 rounded-xl bg-amber-950/10">
                                        <AlertTriangle className="h-8 w-8 mb-2 text-amber-500 opacity-70" />
                                        <p className="text-sm text-amber-400 font-medium">No HR or company email found</p>
                                        <p className="text-xs mt-1 text-neutral-500 text-center max-w-xs">The AI could not locate an HR or company contact email for this company, so an outreach email could not be generated.</p>
                                    </div>
                                ) : lead.draft_email_subject ? (
                                    <div className="bg-black/40 rounded-xl overflow-hidden border border-neutral-800">
                                        <div className="bg-neutral-900/80 px-4 md:px-5 py-3 border-b border-neutral-800 flex items-center gap-3">
                                            <span className="text-neutral-500 text-sm font-medium">Subject:</span>
                                            <span className="text-white text-sm font-semibold truncate">{lead.draft_email_subject}</span>
                                        </div>
                                        {emailTarget && (
                                            <div className="bg-neutral-900/40 px-4 md:px-5 py-2 border-b border-neutral-800 flex items-center gap-3">
                                                <span className="text-neutral-500 text-xs">To:</span>
                                                <span className="text-neutral-300 text-xs">{emailTarget}</span>
                                            </div>
                                        )}
                                        <div className="p-4 md:p-6 text-neutral-300 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                                            {lead.draft_email_body}
                                        </div>
                                        <div className="bg-neutral-900/40 px-4 md:px-5 py-3 border-t border-neutral-800 flex justify-end">
                                            <Button size="sm" variant="ghost" onClick={copyEmail} className="text-neutral-400 hover:text-white gap-2">
                                                {copied ? <CheckCheck className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                                {copied ? "Copied!" : "Copy Email"}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-8 text-neutral-500 border-2 border-dashed border-neutral-800 rounded-xl">
                                        <Mail className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">No email draft generated yet.</p>
                                        <p className="text-xs mt-1 text-neutral-600">Run the research agent to generate a personalized email.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <motion.div className="space-y-6" variants={itemVariants}>
                    {lead.human_review_reason && (
                        <Card className="border-amber-500/30 bg-amber-500/10">
                            <CardContent className="p-4 flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-amber-500 text-sm mb-1">Review Required</h4>
                                    <p className="text-amber-200/80 text-sm">{lead.human_review_reason}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-neutral-800 bg-neutral-900/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-emerald-400" /> Lead Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center pt-2 pb-6">
                            <div className="relative h-36 w-36 flex items-center justify-center mb-6">
                                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-neutral-800" />
                                    <motion.circle
                                        cx="50" cy="50" r="45"
                                        fill="none"
                                        stroke={lead.score > 70 ? "#10b981" : lead.score > 40 ? "#f59e0b" : "#ef4444"}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray="283"
                                        initial={{ strokeDashoffset: 283 }}
                                        animate={{ strokeDashoffset: 283 - (283 * lead.score) / 100 }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl font-bold text-white">{lead.score}</span>
                                    <span className="text-xs text-neutral-500 uppercase tracking-widest mt-1">/ 100</span>
                                </div>
                            </div>

                            {lead.score_breakdown && (
                                <div className="w-full space-y-3">
                                    {Object.entries(lead.score_breakdown).map(([key, data]: [string, any], i) => (
                                        <motion.div
                                            key={key}
                                            className="space-y-1 relative group"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + (i * 0.1) }}
                                            onMouseEnter={() => setHoveredBar(key)}
                                            onMouseLeave={() => setHoveredBar(null)}
                                        >
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="capitalize text-neutral-300 flex items-center gap-1">
                                                    {key.replace(/_/g, " ")}
                                                    <Info className="h-3 w-3 text-neutral-600" />
                                                </span>
                                                <span className="text-neutral-500">{data.score}/{data.max}</span>
                                            </div>
                                            <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden cursor-pointer">
                                                <motion.div
                                                    className={`h-full rounded-full ${data.score / data.max > 0.7 ? "bg-emerald-500" : data.score / data.max > 0.4 ? "bg-amber-500" : "bg-red-500"}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(data.score / data.max) * 100}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                                />
                                            </div>
                                            {hoveredBar === key && data.reasoning && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="absolute z-20 left-0 right-0 top-full mt-1 p-3 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl"
                                                >
                                                    <p className="text-xs text-neutral-300">{data.reasoning}</p>
                                                    {data.evidence && data.evidence !== "no direct evidence" && (
                                                        <p className="text-xs text-neutral-500 mt-1 italic">Evidence: {data.evidence}</p>
                                                    )}
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-neutral-800 bg-neutral-900/50">
                        <CardHeader><CardTitle className="text-sm">Firmographics</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <InfoRow label="Industry" value={lead.industry} />
                            <InfoRow label="Size" value={lead.employee_count} />
                            <InfoRow label="Model" value={lead.is_b2b ? "B2B" : lead.is_b2b === false ? "B2C" : null} />
                            <InfoRow label="Headquarters" value={lead.headquarters} icon={<MapPin className="h-3 w-3" />} />
                            <InfoRow label="Founded" value={lead.founded_year} icon={<Calendar className="h-3 w-3" />} />
                            <InfoRow label="Funding" value={lead.funding_status} icon={<TrendingUp className="h-3 w-3" />} />
                            <InfoRow label="HR Email" value={lead.hr_email} icon={<Mail className="h-3 w-3" />} />
                            <InfoRow label="Company Email" value={lead.company_email} icon={<Mail className="h-3 w-3" />} />

                            {lead.tech_stack && lead.tech_stack.length > 0 && (
                                <div className="pt-3 border-t border-neutral-800">
                                    <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider font-semibold">Tech Stack</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {lead.tech_stack.map((tech: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="bg-neutral-800 text-neutral-300 text-xs border-neutral-700">
                                                {tech}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {lead.processing_time_seconds && (
                        <div className="text-center text-xs text-neutral-600">
                            Processed in {lead.processing_time_seconds.toFixed(1)}s
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}

function InfoRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="flex justify-between text-sm items-center">
            <span className="text-neutral-500 flex items-center gap-1.5">{icon}{label}</span>
            <span className="text-white font-medium text-right max-w-[60%] truncate">{value}</span>
        </div>
    );
}
