import { use, type ComponentProps, type ReactElement } from "react";
import { Slot, Tooltip } from "radix-ui";

import { cn } from "../classNames.js";
import { PanelContext } from "./panelContext.js";

export function NavLink({
    icon,
    label,
    current,
    asChild = false,
    className,
    children,
    ...props
}: Omit<ComponentProps<"a">, "children"> & {
    icon: ReactElement;
    label: string;
    current: boolean;
    asChild?: boolean;
    children?: ReactElement;
}) {
    const { collapsed, side } = use(PanelContext);
    const Comp = asChild ? Slot.Root : "a";
    const link = (
        <Comp
            data-slot="nav-link"
            aria-current={current ? "page" : undefined}
            aria-label={collapsed ? label : undefined}
            className={cn(
                "flex h-9 items-center gap-3 rounded-md px-2 text-sm text-foreground outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring/50",
                collapsed && "w-9",
                current &&
                    "relative bg-accent text-accent-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-primary hover:bg-accent",
                className,
            )}
            {...props}
        >
            <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center *:size-full">
                {icon}
            </span>
            <Slot.Slottable>{children}</Slot.Slottable>
            {!collapsed && <span className="truncate">{label}</span>}
        </Comp>
    );
    if (!collapsed) return link;
    return (
        <Tooltip.Root>
            <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content
                    side={side === "left" ? "right" : "left"}
                    sideOffset={8}
                    className="z-[60] rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground shadow-md"
                >
                    {label}
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
}
