"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Clock, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useState, useEffect } from "react";

interface UsageLimitModalProps {
    open: boolean;
    onClose: () => void;
}

export function UsageLimitModal({ open, onClose }: UsageLimitModalProps) {
    const [hoursLeft, setHoursLeft] = useState(0);
    const [minutesLeft, setMinutesLeft] = useState(0);

    useEffect(() => {
        if (!open) return;
        const now = new Date();
        const midnight = new Date(now);
        midnight.setUTCHours(24, 0, 0, 0);
        const diff = midnight.getTime() - now.getTime();
        setHoursLeft(Math.floor(diff / (1000 * 60 * 60)));
        setMinutesLeft(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-xl p-8 shadow-2xl shadow-violet-500/10">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <motion.div
                                    initial={{ rotate: -10 }}
                                    animate={{ rotate: [0, -5, 5, 0] }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6"
                                >
                                    <ShieldAlert className="h-8 w-8 text-amber-500" />
                                </motion.div>

                                <h3 className="text-xl font-bold text-white mb-2">
                                    Free Tier Limit Reached
                                </h3>
                                <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                                    You've used all 5 free AI research credits for today.
                                    Credits reset daily at midnight UTC.
                                </p>

                                <div className="flex items-center gap-3 bg-neutral-800/50 rounded-xl px-5 py-3 mb-6 border border-neutral-700/50">
                                    <Clock className="h-5 w-5 text-violet-400" />
                                    <div className="text-left">
                                        <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Resets in</p>
                                        <p className="text-lg font-bold text-white">
                                            {hoursLeft}h {minutesLeft}m
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full space-y-3">
                                    <Link href="/pricing" className="block w-full">
                                        <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white h-11 text-sm gap-2 shadow-lg shadow-violet-500/20">
                                            <Sparkles className="h-4 w-4" />
                                            Upgrade to Pro — 50 searches/day
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        onClick={onClose}
                                        className="w-full text-neutral-400 hover:text-white h-10 text-sm"
                                    >
                                        I'll wait for the reset
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
