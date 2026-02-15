"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CreditCard, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface UsageExhaustedModalProps {
    open: boolean;
    onClose: () => void;
    type: "search" | "csv";
}

export function UsageExhaustedModal({ open, onClose, type }: UsageExhaustedModalProps) {
    const now = new Date();
    const resetTime = new Date(now);
    resetTime.setDate(resetTime.getDate() + 1);
    resetTime.setHours(0, 0, 0, 0);
    const hoursRemaining = Math.ceil((resetTime.getTime() - now.getTime()) / (1000 * 60 * 60));

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors">
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                                <AlertTriangle className="h-8 w-8 text-amber-500" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">
                                Daily {type === "search" ? "Search" : "Upload"} Limit Reached
                            </h2>

                            <p className="text-neutral-400 mb-6">
                                You&apos;ve used all {type === "search" ? "5 AI searches" : "5 CSV uploads"} available
                                on the Free tier today.
                            </p>

                            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8 bg-neutral-800/50 px-4 py-2 rounded-lg">
                                <Clock className="h-4 w-4" />
                                <span>Resets in {hoursRemaining} {hoursRemaining === 1 ? "hour" : "hours"}</span>
                            </div>

                            <Link href="/pricing" className="w-full">
                                <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20" size="lg">
                                    <CreditCard className="mr-2 h-5 w-5" />
                                    Upgrade to Pro
                                </Button>
                            </Link>

                            <button onClick={onClose} className="mt-4 text-neutral-500 hover:text-neutral-300 text-sm transition-colors">
                                Maybe later
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
