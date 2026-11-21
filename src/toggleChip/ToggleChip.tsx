import * as React from "react";
import { Toggle } from "radix-ui";

import { cn } from "../classNames.js";
import { Tooltip } from "../tooltip/Tooltip.js";

export function ToggleChip({
    className,
    children,
    help,
    ...props
}: Omit<React.ComponentProps<typeof Toggle.Root>, "pressed" | "defaultPressed" | "onPressedChange"> & {
    pressed: boolean;
    onPressedChange: (pressed: boolean) => void;
    help?: React.ReactNode;
}) {
    return (
        <Tooltip label={help} disabled={help === undefined}>
            <Toggle.Root
                data-slot="toggle-chip"
                className={cn(
                    "group inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-input bg-secondary px-3 text-[13px] font-medium whitespace-nowrap text-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:border-primary data-[state=on]:bg-primary-light data-[state=on]:text-primary-light-foreground data-[state=on]:hover:bg-primary-light-hover",
                    className,
                )}
                {...props}
            >
                <svg
                    viewBox="0 0 16 16"
                    className="hidden size-3.5 group-data-[state=on]:block"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M3.5 8.5l3 3 6-7" />
                </svg>
                {children}
            </Toggle.Root>
        </Tooltip>
    );
}
