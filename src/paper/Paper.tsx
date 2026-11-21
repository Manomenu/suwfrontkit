import * as React from "react";

import { cn } from "../classNames.js";

const PAPER = "rounded-lg border border-border bg-card p-4";

export function Paper({ title, className, children, ...props }: Omit<React.ComponentProps<"div">, "title"> & { title?: string }) {
    if (title === undefined) {
        return (
            <div className={cn(PAPER, className)} {...props}>
                {children}
            </div>
        );
    }
    return (
        <div role="region" aria-label={title} className={cn(PAPER, "flex flex-col gap-2", className)} {...props}>
            <h2 className="text-base font-semibold">{title}</h2>
            {children}
        </div>
    );
}
