"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-700 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-white text-neutral-900 shadow hover:bg-neutral-200",
                destructive:
                    "bg-red-900 text-red-100 hover:bg-red-800",
                outline:
                    "border border-neutral-800 bg-transparent shadow-sm hover:bg-neutral-900",
                secondary:
                    "bg-neutral-800 text-neutral-100 shadow-sm hover:bg-neutral-700",
                ghost: "hover:bg-neutral-900 hover:text-neutral-100",
                link: "text-neutral-100 underline-offset-4 hover:underline",
                premium: "bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-lg shadow-amber-900/20 hover:from-yellow-500 hover:to-amber-500 border border-yellow-500/20",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends Omit<HTMLMotionProps<"button">, "ref" | "children">,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
    children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, isLoading, children, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
                className={cn(buttonVariants({ variant, size, className }))}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </motion.button>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
