"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function Header() {
    const pathname = usePathname();
    const pageName = pathname.split("/").pop() || "Dashboard";
    const title = pageName.charAt(0).toUpperCase() + pageName.slice(1);

    return (
        <header className="flex h-16 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-8">
            <h1 className="text-xl font-bold text-white capitalize">{title}</h1>
            <div className="flex items-center gap-4">
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                    <Input
                        type="search"
                        placeholder="Search leads..."
                        className="pl-9 h-9 border-neutral-800 bg-neutral-900 focus-visible:ring-violet-500"
                    />
                </div>
                <Button variant="ghost" size="icon" className="relative text-neutral-400 hover:text-white">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-violet-600 border border-neutral-950"></span>
                </Button>
            </div>
        </header>
    );
}
