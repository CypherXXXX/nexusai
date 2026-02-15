"use client";

import { CreateLeadModal } from "@/components/dashboard/CreateLeadModal";
import { LeadTable } from "@/components/dashboard/LeadTable";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

export default function LeadsPage() {
    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Users className="h-7 w-7 text-violet-400" />
                        Leads Pipeline
                    </h2>
                    <p className="text-neutral-400 text-sm mt-1">
                        Manage and track your leads through the AI qualification process.
                    </p>
                </div>
                <CreateLeadModal />
            </motion.div>

            <LeadTable />
        </div>
    );
}
