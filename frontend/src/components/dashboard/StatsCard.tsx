import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
}

export function StatsCard({ title, value, description, icon: Icon, trend, trendUp }: StatsCardProps) {
    return (
        <Card className="hover:border-neutral-700 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-400">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-neutral-500 mt-1">
                        {trend && (
                            <span className={trendUp ? "text-emerald-500" : "text-red-500"}>
                                {trend}
                            </span>
                        )}
                        {trend && " "}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
