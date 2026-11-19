import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "../classNames.js";

export function NavLink({
    current,
    asChild = false,
    className,
    ...props
}: React.ComponentProps<"a"> & { current: boolean; asChild?: boolean }) {
    const Comp = asChild ? Slot.Root : "a";
    return (
        <Comp
            data-slot="nav-link"
            aria-current={current ? "page" : undefined}
            className={cn(
                "block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent/50",
                current && "bg-primary-light text-primary-light-foreground",
                className,
            )}
            {...props}
        />
    );
}
