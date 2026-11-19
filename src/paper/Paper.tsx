import * as React from "react";

import { cn } from "../classNames.js";

export function Paper({ className, ...props }: React.ComponentProps<"div">) {
    return <div className={cn("rounded-lg border border-border bg-card p-4", className)} {...props} />;
}

export function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <Paper aria-label={title} role="region" className={cn("flex flex-col gap-2", className)}>
            <h2 className="text-base font-semibold">{title}</h2>
            {children}
        </Paper>
    );
}
