"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles, ArrowLeft, Zap, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useState } from "react";

const tiers = [
    {
        name: "Free",
        price: "₹0",
        period: "forever",
        description: "Get started with AI-powered lead intelligence",
        icon: Zap,
        accent: "from-neutral-600 to-neutral-500",
        borderColor: "border-neutral-700",
        features: [
            { text: "5 AI searches per day", included: true },
            { text: "5 CSV uploads per day", included: true },
            { text: "AI email drafts", included: true },
            { text: "Lead scoring", included: true },
            { text: "Auto-send emails", included: false },
            { text: "Priority research queue", included: false },
            { text: "Custom scoring rubric", included: false },
            { text: "API access", included: false },
            { text: "Dedicated support", included: false },
        ],
        cta: "Current Plan",
        plan: null,
    },
    {
        name: "Pro",
        price: "₹999",
        period: "month",
        description: "For growth-stage teams that need scale",
        icon: Sparkles,
        accent: "from-violet-600 to-purple-600",
        borderColor: "border-violet-500/50",
        badge: "Most Popular",
        features: [
            { text: "50 AI searches per day", included: true },
            { text: "25 CSV uploads per day", included: true },
            { text: "AI email drafts", included: true },
            { text: "Lead scoring", included: true },
            { text: "Auto-send emails", included: true },
            { text: "Priority research queue", included: true },
            { text: "Custom scoring rubric", included: false },
            { text: "API access", included: false },
            { text: "Email support (24h)", included: true },
        ],
        cta: "Upgrade to Pro",
        plan: "pro",
    },
    {
        name: "Enterprise",
        price: "₹4,999",
        period: "month",
        description: "Unlimited power for serious sales operations",
        icon: Crown,
        accent: "from-cyan-500 to-blue-600",
        borderColor: "border-cyan-500/30",
        features: [
            { text: "Unlimited AI searches", included: true },
            { text: "Unlimited CSV uploads", included: true },
            { text: "AI email drafts", included: true },
            { text: "Lead scoring", included: true },
            { text: "Auto-send emails", included: true },
            { text: "Priority research queue", included: true },
            { text: "Custom scoring rubric", included: true },
            { text: "Full API access", included: true },
            { text: "Dedicated account manager", included: true },
        ],
        cta: "Get Enterprise",
        plan: "enterprise",
    },
];

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleCheckout = async (plan: string) => {
        try {
            setLoading(plan);
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-neutral-950 to-neutral-950" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
                <Link href="/dashboard">
                    <Button variant="ghost" className="text-neutral-400 hover:text-white mb-8 pl-0">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Choose Your <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Power Level</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        Scale your AI sales intelligence from startup to enterprise.
                        Every plan includes our core AI research and scoring engine.
                    </p>
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-8 md:grid-cols-3"
                >
                    {tiers.map((tier, i) => (
                        <motion.div
                            key={tier.name}
                            variants={item}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className={`relative rounded-2xl border ${tier.borderColor} bg-neutral-900/60 backdrop-blur-sm p-8 flex flex-col ${i === 1 ? "ring-2 ring-violet-500/40 shadow-xl shadow-violet-500/10" : ""}`}
                        >
                            {tier.badge && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                                        {tier.badge}
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${tier.accent} flex items-center justify-center mb-4`}>
                                    <tier.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                                <p className="text-neutral-400 text-sm mt-1">{tier.description}</p>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-bold text-white">{tier.price}</span>
                                {tier.period !== "forever" && (
                                    <span className="text-neutral-500 text-sm ml-1">/{tier.period}</span>
                                )}
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {tier.features.map((feature, j) => (
                                    <li key={j} className="flex items-center gap-3 text-sm">
                                        {feature.included ? (
                                            <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                        ) : (
                                            <X className="h-4 w-4 text-neutral-600 flex-shrink-0" />
                                        )}
                                        <span className={feature.included ? "text-neutral-300" : "text-neutral-600"}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full ${i === 1 ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20" : i === 2 ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`}
                                size="lg"
                                disabled={!tier.plan || loading === tier.plan}
                                onClick={() => tier.plan && handleCheckout(tier.plan)}
                            >
                                {loading === tier.plan ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                {tier.cta}
                            </Button>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-16 text-neutral-500 text-sm"
                >
                    <p>All plans include a 7-day free trial. Cancel anytime. Prices in INR. No credit card required for Free tier.</p>
                </motion.div>
            </div>
        </div>
    );
}
