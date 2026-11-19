import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "../classNames.js";

export function Anchor({ className, asChild = false, ...props }: React.ComponentProps<"a"> & { asChild?: boolean }) {
    const Comp = asChild ? Slot.Root : "a";
    return <Comp data-slot="anchor" className={cn("text-anchor underline-offset-4 hover:underline", className)} {...props} />;
}
