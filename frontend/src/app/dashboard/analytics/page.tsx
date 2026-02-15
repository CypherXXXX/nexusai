"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, TrendingUp, Users, Target, Zap } from "lucide-react";
import {
    Bar,
    BarChart,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useAnalytics, useScoreDistribution, useStatusCounts } from "@/hooks/useAnalytics";

const COLORS = ["#7c3aed", "#14b8a6", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899"];

const STATUS_COLORS: Record<string, string> = {
    new: "#3b82f6",
    researching: "#8b5cf6",
    enriching: "#a855f7",
    scoring: "#7c3aed",
    drafting_complete: "#14b8a6",
    human_review: "#f59e0b",
    approved: "#10b981",
    sent: "#22c55e",
    rejected: "#ef4444",
    failed: "#dc2626",
};

export default function AnalyticsPage() {
    const { summary, isLoading: loadingSummary } = useAnalytics();
    const { distribution: scoreDist, isLoading: loadingScore } = useScoreDistribution();
    const { counts: statusCounts, isLoading: loadingStatus } = useStatusCounts();

    const pieData = statusCounts
        ? Object.entries(statusCounts)
            .filter(([, value]) => (value as number) > 0)
            .map(([name, value]) => ({
                name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                value: value as number,
                fill: STATUS_COLORS[name] || "#525252",
            }))
        : [];

    if (loadingSummary && loadingScore && loadingStatus) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Analytics</h2>
                <p className="text-neutral-400">Real-time insights into your pipeline performance.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<Users className="h-4 w-4" />}
                    label="Total Leads"
                    value={summary?.total_leads ?? 0}
                    color="text-blue-400"
                />
                <StatCard
                    icon={<Target className="h-4 w-4" />}
                    label="Avg Score"
                    value={summary?.avg_score ?? 0}
                    suffix="/100"
                    color="text-emerald-400"
                />
                <StatCard
                    icon={<Zap className="h-4 w-4" />}
                    label="Avg Speed"
                    value={summary?.avg_processing_time ?? 0}
                    suffix="s"
                    color="text-amber-400"
                />
                <StatCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Accuracy"
                    value={summary?.accuracy ?? 0}
                    suffix="%"
                    color="text-violet-400"
                />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card className="col-span-1 border-neutral-800 bg-neutral-900/40">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Lead Status Distribution
                            {!loadingStatus && (
                                <span className="text-xs text-neutral-500 font-normal flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "8px", color: "#fff" }}
                                        itemStyle={{ color: "#fff" }}
                                    />
                                    <Legend formatter={(value) => <span className="text-neutral-300 text-xs">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-neutral-600 text-sm">
                                No data yet — process leads to see status distribution
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-1 border-neutral-800 bg-neutral-900/40">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Lead Score Distribution
                            {!loadingScore && (
                                <span className="text-xs text-neutral-500 font-normal flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {scoreDist && scoreDist.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={scoreDist}>
                                    <XAxis dataKey="score" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: "#262626" }}
                                        contentStyle={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "8px", color: "#fff" }}
                                        labelStyle={{ color: "#fff" }}
                                        formatter={(value: any) => [`${value} leads`, "Count"]}
                                        labelFormatter={(label) => `Score: ${label}`}
                                    />
                                    <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]}>
                                        {scoreDist.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-neutral-600 text-sm">
                                No scores yet — process leads to see score distribution
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, suffix, color }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    suffix?: string;
    color: string;
}) {
    return (
        <Card className="border-neutral-800 bg-neutral-900/40">
            <CardContent className="p-5">
                <div className={`flex items-center gap-2 text-xs uppercase tracking-wider font-semibold mb-2 ${color}`}>
                    {icon}
                    {label}
                </div>
                <div className="text-2xl font-bold text-white">
                    {typeof value === "number" ? value.toLocaleString() : value}
                    {suffix && <span className="text-sm text-neutral-500 ml-1">{suffix}</span>}
                </div>
            </CardContent>
        </Card>
    );
}
