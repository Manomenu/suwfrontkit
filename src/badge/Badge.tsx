import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../classNames.js";

const badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold tracking-wide whitespace-nowrap uppercase", {
    variants: {
        variant: {
            neutral: "bg-secondary text-muted-foreground",
            primary: "bg-primary-light text-primary-light-foreground",
            success: "bg-success-light text-success",
            warning: "bg-warning-light text-warning",
            danger: "bg-destructive-light text-destructive",
            info: "bg-info-light text-info",
        },
    },
    defaultVariants: { variant: "neutral" },
});

export function Badge({
    className,
    variant,
    dot = false,
    children,
    ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { dot?: boolean | "pulsing" }) {
    return (
        <span data-slot="badge" className={cn(badgeVariants({ variant }), dot !== false && "gap-1.5", className)} {...props}>
            {dot !== false && (
                <span
                    aria-hidden="true"
                    className={cn("size-1.5 shrink-0 rounded-full bg-current", dot === "pulsing" && "motion-safe:animate-pulse")}
                />
            )}
            {children}
        </span>
    );
}
