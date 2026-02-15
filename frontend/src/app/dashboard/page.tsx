"use client";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { Activity, DollarSign, Users, Zap } from "lucide-react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { LeadTable } from "@/components/dashboard/LeadTable";
import { CreateLeadModal } from "@/components/dashboard/CreateLeadModal";
import { motion } from "framer-motion";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function DashboardPage() {
    const { data: summary, isLoading } = useSWR("/api/analytics/summary", fetcher, {
        refreshInterval: 5000,
    });

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Dashboard</h2>
                    <p className="text-neutral-400 text-sm">
                        Real-time overview of your AI sales intelligence pipeline.
                    </p>
                </div>
                <CreateLeadModal />
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            >
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-[120px] rounded-xl" />
                    ))
                ) : (
                    <>
                        <motion.div variants={item}>
                            <StatsCard
                                title="Total Leads"
                                value={summary?.total_leads || 0}
                                icon={Users}
                                description="All time leads processed"
                            />
                        </motion.div>
                        <motion.div variants={item}>
                            <StatsCard
                                title="Qualified"
                                value={summary?.qualified || 0}
                                icon={Activity}
                                description="Leads with score ≥ 70"
                                trend={summary?.total_leads > 0 ? `${Math.round(((summary?.qualified || 0) / summary.total_leads) * 100)}%` : "0%"}
                                trendUp={true}
                            />
                        </motion.div>
                        <motion.div variants={item}>
                            <StatsCard
                                title="Pending Review"
                                value={summary?.pending_review || 0}
                                icon={Zap}
                                description="Awaiting your decision"
                            />
                        </motion.div>
                        <motion.div variants={item}>
                            <StatsCard
                                title="Avg Score"
                                value={summary?.avg_score || 0}
                                icon={DollarSign}
                                description={`Avg processing: ${summary?.avg_processing_time || 0}s`}
                            />
                        </motion.div>
                    </>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <h3 className="text-xl font-semibold text-white mb-4">Pipeline</h3>
                <LeadTable />
            </motion.div>
        </div>
    );
}
