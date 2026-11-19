import * as React from "react";
import { cn } from "../classNames.js";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                "h-48 w-full resize-none rounded-md border border-input bg-secondary px-3 py-2 font-mono text-sm text-foreground transition-colors outline-none disabled:cursor-not-allowed disabled:text-placeholder",
                "focus-visible:border-primary",
                "aria-invalid:border-destructive",
                className,
            )}
            {...props}
        />
    );
}

export { Textarea };
