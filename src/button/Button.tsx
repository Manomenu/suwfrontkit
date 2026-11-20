import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../classNames.js";
import { Slot } from "radix-ui";

const buttonVariants = cva(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-secondary disabled:text-placeholder [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary-hover",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
                outline: "border border-input bg-secondary text-foreground hover:bg-accent",
                ghost: "text-foreground hover:bg-accent",
                link: "text-anchor underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-[18px]",
                sm: "h-[30px] px-3.5 text-[13px]",
                xs: "h-6 gap-1 px-2 text-xs",
                icon: "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

function Button({
    className,
    variant = "default",
    size = "default",
    asChild = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot.Root : "button";

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button };
