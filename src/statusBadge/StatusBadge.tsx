import type { ComponentProps } from "react";

import { Badge } from "../badge/Badge.js";
import { cn } from "../classNames.js";

const BADGE_OF_STATUS = {
    success: "success",
    warning: "warning",
    danger: "danger",
    info: "info",
    neutral: "neutral",
    pending: "info",
} as const;

export type Status = keyof typeof BADGE_OF_STATUS;

export function StatusBadge({ status, className, children, ...props }: Omit<ComponentProps<typeof Badge>, "variant"> & { status: Status }) {
    return (
        <Badge variant={BADGE_OF_STATUS[status]} data-status={status} className={cn("gap-1.5", className)} {...props}>
            <span
                aria-hidden="true"
                className={cn("size-1.5 shrink-0 rounded-full bg-current", status === "pending" && "motion-safe:animate-pulse")}
            />
            {children}
        </Badge>
    );
}
