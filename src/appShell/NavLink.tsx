import { use, type ComponentProps, type ReactElement } from "react";
import { Slot, Tooltip } from "radix-ui";

import { cn } from "../classNames.js";
import { useLinkClick } from "../leaveGuard/LinkProvider.js";
import { NavLevelContext } from "./navLevel.js";
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
    const { level, holdsCurrent } = use(NavLevelContext);
    const nested = level > 1;
    const onClick = useLinkClick(props.onClick);
    const Comp = asChild ? Slot.Root : "a";
    const link = (
        <Comp
            data-slot="nav-link"
            aria-current={current ? "page" : undefined}
            data-holds-current={holdsCurrent && !current ? "" : undefined}
            aria-label={collapsed ? label : undefined}
            className={cn(
                "flex h-9 items-center gap-3 rounded-md px-2 text-sm text-foreground outline-none hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring/50",
                collapsed && "w-9",
                nested && "h-8",
                nested && collapsed && "h-7 justify-center px-0",
                holdsCurrent && !current && !collapsed && "bg-accent/25 font-medium",
                current &&
                    "relative bg-accent text-accent-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-primary hover:bg-accent hover:text-accent-foreground",
                className,
            )}
            {...props}
            onClick={onClick}
        >
            <span aria-hidden="true" className={cn("flex size-5 shrink-0 items-center justify-center *:size-full", nested && "size-4")}>
                {icon}
            </span>
            <Slot.Slottable>{children}</Slot.Slottable>
            {!collapsed && (
                <span className="truncate" title={label}>
                    {label}
                </span>
            )}
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
