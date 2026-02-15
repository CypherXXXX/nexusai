"use client";

import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowRight, Activity, Zap, Target } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { useState, useEffect } from "react";
import { ParticleBackground } from "./ParticleBackground";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const AnimatedNumber = ({ value }: { value: number }) => {
    return (
        <span className="tabular-nums tracking-tighter">
            {value.toLocaleString()}
        </span>
    );
};

export function RealTimeHero() {
    const { data: stats, isLoading } = useSWR("/api/analytics/summary", fetcher, {
        refreshInterval: 5000,
    });

    const totalProcessed = stats?.total_leads || 0;
    const accuracy = stats?.accuracy ?? 0;
    const speed = stats?.avg_processing_time || 0;

    return (
        <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-neutral-950 text-center">
            <ParticleBackground />

            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,10,0.8)_100%)] pointer-events-none" />

            <div className="relative z-10 px-4 max-w-5xl mx-auto flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8 inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-950/20 px-3 py-1 text-sm text-yellow-500 backdrop-blur-md"
                >
                    <span className="flex h-2 w-2 rounded-full bg-yellow-500 mr-2 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                    System Operational • v2.4.0
                </motion.div>

                <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl md:text-8xl mb-6 drop-shadow-2xl">
                    <span className="block mb-2">Autonomous</span>
                    <span className="bg-gradient-to-r from-yellow-200 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                        Sales Agents
                    </span>
                </h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="max-w-2xl text-lg text-neutral-300 sm:text-xl mb-10 leading-relaxed drop-shadow-lg"
                >
                    Replace manual data entry with intelligent automation.
                    Our agents analyze, qualify, and engage leads with human-like precision.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-center gap-4 mb-16"
                >
                    <Link href="/dashboard">
                        <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-neutral-200 border-0 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                            Launch Dashboard
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="https://github.com/your-repo" target="_blank">
                        <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-neutral-700 bg-black/40 hover:bg-neutral-900 text-neutral-300 backdrop-blur-sm">
                            View Documentation
                        </Button>
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl border-t border-neutral-800/50 pt-8 mt-4 backdrop-blur-sm rounded-xl p-6 bg-black/20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="flex flex-col items-center"
                    >
                        <div className="flex items-center gap-2 text-neutral-400 mb-2 text-sm uppercase tracking-wider font-semibold">
                            <Activity className="h-4 w-4 text-emerald-500" />
                            Leads Processed
                        </div>
                        <div className="text-4xl font-bold text-white drop-shadow-md">
                            {isLoading ? "..." : <AnimatedNumber value={totalProcessed} />}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="flex flex-col items-center"
                    >
                        <div className="flex items-center gap-2 text-neutral-400 mb-2 text-sm uppercase tracking-wider font-semibold">
                            <Target className="h-4 w-4 text-yellow-500" />
                            Accuracy
                        </div>
                        <div className="text-4xl font-bold text-white drop-shadow-md">
                            {isLoading ? "..." : <>{accuracy}%</>}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4 }}
                        className="flex flex-col items-center"
                    >
                        <div className="flex items-center gap-2 text-neutral-400 mb-2 text-sm uppercase tracking-wider font-semibold">
                            <Zap className="h-4 w-4 text-amber-500" />
                            Speed / Lead
                        </div>
                        <div className="text-4xl font-bold text-white drop-shadow-md">
                            {isLoading ? "..." : <>{speed}s</>}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="absolute bottom-6 text-xs text-neutral-500 z-10">
                Connected to Core API • Latency: 24ms
            </div>
        </section>
    );
}
