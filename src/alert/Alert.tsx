import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../classNames.js";

const alertVariants = cva("w-full rounded-lg p-4 text-sm", {
    variants: {
        variant: {
            default: "bg-primary-light text-primary-light-foreground",
            destructive: "bg-destructive-light text-destructive-light-foreground",
            warning: "bg-warning-light text-warning",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
    return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}
export { Alert };
