"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    PieChart,
    Upload,
    CreditCard,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Sparkles,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useUser, useClerk } from "@clerk/nextjs";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/leads", icon: Users, label: "Leads" },
    { href: "/dashboard/analytics", icon: PieChart, label: "Analytics" },
    { href: "/dashboard/upload", icon: Upload, label: "Import Data" },
    { href: "/pricing", icon: CreditCard, label: "Pricing" },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useUser();
    const { signOut } = useClerk();

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : user?.firstName
            ? `${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()
            : "U";

    return (
        <motion.aside
            initial={{ width: 240 }}
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ duration: 0.2, ease: "easeInOut" as const }}
            className="relative flex h-screen flex-col border-r border-neutral-800 bg-neutral-950 text-neutral-400 shrink-0"
        >
            <div className="flex h-16 items-center justify-center border-b border-neutral-800 gap-2">
                <motion.div
                    whileHover={{ rotate: 180, scale: 1.2 }}
                    transition={{ duration: 0.4 }}
                >
                    <Sparkles className="h-6 w-6 text-violet-500" />
                </motion.div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="overflow-hidden text-lg font-bold text-white whitespace-nowrap"
                        >
                            Nexus<span className="text-violet-400">AI</span>
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 shadow-md hover:bg-neutral-800"
            >
                {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>

            <nav className="flex-1 space-y-1 p-3 mt-2">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ x: 4 }}
                                className={cn(
                                    "flex items-center rounded-lg px-3 py-2.5 transition-colors relative group",
                                    isActive
                                        ? "bg-violet-500/10 text-violet-400"
                                        : "text-neutral-400 hover:bg-neutral-900 hover:text-white",
                                    collapsed ? "justify-center" : "justify-start"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-violet-500 rounded-r-full"
                                        transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.15 }}>
                                    <item.icon className={cn("h-5 w-5", isActive && "text-violet-400")} />
                                </motion.div>
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        className="ml-3 truncate text-sm font-medium"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-neutral-800 p-3">
                <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                            {user?.imageUrl ? (
                                <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        {!collapsed && (
                            <div className="ml-3 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.username || user?.firstName || "User"}
                                </p>
                                <p className="text-xs text-neutral-500">Free Tier</p>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-neutral-500 hover:text-red-400"
                            onClick={() => signOut({ redirectUrl: "/" })}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </motion.aside>
    );
}
