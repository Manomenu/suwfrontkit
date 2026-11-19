import * as React from "react";
import { cn } from "../classNames.js";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "h-9 w-full min-w-0 rounded-md border border-input bg-secondary px-3 text-sm text-foreground transition-colors outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:cursor-not-allowed disabled:text-placeholder",
                "focus-visible:border-primary",
                "aria-invalid:border-destructive",
                className,
            )}
            {...props}
        />
    );
}

export { Input };
