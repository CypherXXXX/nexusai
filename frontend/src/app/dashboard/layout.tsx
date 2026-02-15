"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { AuthSync } from "@/components/auth/AuthSync";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-neutral-950">
            <div className="hidden md:block">
                <Sidebar />
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 md:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 z-50 md:hidden"
                        >
                            <Sidebar />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 overflow-y-auto bg-neutral-950">
                <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800">
                    <button onClick={() => setMobileOpen(true)} className="text-neutral-400 hover:text-white">
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="text-lg font-bold text-white">Nexus<span className="text-violet-400">AI</span></span>
                    <div className="w-6" />
                </div>
                <div className="p-4 md:p-8">
                    <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500">
                        <AuthSync>{children}</AuthSync>
                    </div>
                </div>
            </main>
        </div>
    );
}
