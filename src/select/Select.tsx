import * as React from "react";
import { cn } from "../classNames.js";

export function Select({ className, ...props }: React.ComponentProps<"select">) {
    return (
        <select
            data-slot="select"
            className={cn(
                "h-9 min-w-0 rounded-md border border-input bg-secondary px-3 text-sm text-foreground transition-colors outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:text-placeholder aria-invalid:border-destructive",
                className,
            )}
            {...props}
        />
    );
}
