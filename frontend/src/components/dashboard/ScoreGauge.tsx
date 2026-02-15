"use client";

import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
    score: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export function ScoreGauge({ score, size = "md", showLabel = true }: ScoreGaugeProps) {
    const radius = 15.9155;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const sizeClasses = {
        sm: "h-12 w-12 text-xs",
        md: "h-24 w-24 text-2xl",
        lg: "h-32 w-32 text-3xl",
    };

    const strokeWidth = size === "sm" ? 4 : 3;

    let color = "text-red-500";
    if (score >= 70) color = "text-emerald-500";
    else if (score >= 40) color = "text-amber-500";

    return (
        <div className="flex flex-col items-center justify-center">
            <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
                <svg className="h-full w-full -rotate-90 text-neutral-800" viewBox="0 0 36 36">
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                    />
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        className={color}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${score}, 100`}
                    />
                </svg>
                {showLabel && (
                    <span className={cn("absolute font-bold text-white")}>
                        {score}
                    </span>
                )}
            </div>
        </div>
    );
}
