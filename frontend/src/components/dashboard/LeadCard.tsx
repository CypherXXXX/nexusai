"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Building2, Globe, Mail } from "lucide-react";
import Link from "next/link";
import { ScoreGauge } from "./ScoreGauge";
import { StatusBadge } from "./StatusBadge";

interface LeadCardProps {
    lead: any;
}

export function LeadCard({ lead }: LeadCardProps) {
    return (
        <Card className="overflow-hidden transition-all hover:border-neutral-700 hover:bg-neutral-900/40">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                        {lead.company_name}
                        {lead.is_b2b && <Badge variant="outline" className="text-[10px] h-5">B2B</Badge>}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                        {lead.company_website && (
                            <a
                                href={lead.company_website}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center hover:text-white"
                            >
                                <Globe className="mr-1 h-3 w-3" /> Website
                            </a>
                        )}
                        <span className="flex items-center">
                            <Building2 className="mr-1 h-3 w-3" /> {lead.employee_count || "Size Unknown"}
                        </span>
                    </div>
                </div>
                <StatusBadge status={lead.status} />
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between pb-4">
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-neutral-300">
                            {lead.contact_name || "Unknown Contact"}
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center">
                            <Mail className="mr-1 h-3 w-3" /> {lead.contact_email || "No Email"}
                        </div>
                    </div>
                    <ScoreGauge score={lead.score} size="sm" showLabel={true} />
                </div>

                {lead.pain_points && lead.pain_points.length > 0 && (
                    <div className="mt-2 space-y-1">
                        <span className="text-xs font-semibold text-neutral-500 uppercase">Top Insight</span>
                        <p className="text-xs text-neutral-400 line-clamp-2">
                            {lead.pain_points[0]}
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="bg-neutral-900/30 p-2">
                <Button variant="ghost" className="w-full text-xs h-8 text-neutral-400 hover:text-white" asChild>
                    <Link href={`/dashboard/leads/${lead.lead_id}`}>
                        View Details <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
