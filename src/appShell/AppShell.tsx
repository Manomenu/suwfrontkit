import { useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "../classNames.js";
import { COLLAPSED_PANEL_WIDTH, HEADER_HEIGHT, PANEL_WIDTH, panelSideClasses } from "./layout.js";
import { storeCollapsed, storedCollapsed } from "./panelPreference.js";

export function AppShell({
    header,
    panel,
    panelLabel,
    storageKey,
    side = "left",
    children,
}: {
    header: ReactNode;
    panel: ReactNode;
    panelLabel: string;
    storageKey: string;
    side?: "left" | "right";
    children: ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(() => storedCollapsed(storageKey) ?? false);
    const classes = panelSideClasses(side);

    return (
        <div className="min-h-screen" style={{ "--header-height": `${String(HEADER_HEIGHT)}px` } as CSSProperties}>
            <header
                className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background px-4"
                style={{ height: HEADER_HEIGHT }}
            >
                {header}
            </header>
            <div className={cn("flex", classes.row)}>
                <aside
                    id="navigation-panel"
                    className={cn("sticky flex shrink-0 flex-col gap-1 overflow-y-auto border-border bg-background p-1.5", classes.border)}
                    style={{
                        width: collapsed ? COLLAPSED_PANEL_WIDTH : PANEL_WIDTH,
                        top: HEADER_HEIGHT,
                        height: `calc(100vh - ${String(HEADER_HEIGHT)}px)`,
                    }}
                >
                    <button
                        type="button"
                        aria-label={panelLabel}
                        aria-expanded={!collapsed}
                        aria-controls="navigation-panel"
                        title={panelLabel}
                        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground hover:bg-accent/50"
                        onClick={() => {
                            setCollapsed(!collapsed);
                            storeCollapsed(storageKey, !collapsed);
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" stroke="currentColor" strokeWidth="2">
                            <path d="M2 5h16M2 10h16M2 15h16" />
                        </svg>
                    </button>
                    {!collapsed && <div className="flex min-h-0 flex-1 flex-col px-1 pb-1">{panel}</div>}
                </aside>
                <main className="min-w-0 flex-1 p-4">{children}</main>
            </div>
        </div>
    );
}
