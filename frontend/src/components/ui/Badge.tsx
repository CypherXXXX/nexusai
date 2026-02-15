import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200/80",
                secondary:
                    "border-transparent bg-neutral-800 text-neutral-100 hover:bg-neutral-800/80",
                destructive:
                    "border-transparent bg-red-900 text-red-100 hover:bg-red-900/80",
                outline: "text-neutral-200 border-neutral-700",
                success:
                    "border-transparent bg-emerald-900 text-emerald-100 hover:bg-emerald-900/80",
                warning:
                    "border-transparent bg-amber-900 text-amber-100 hover:bg-amber-900/80",
                info: "border-transparent bg-sky-900 text-sky-100 hover:bg-sky-900/80",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
