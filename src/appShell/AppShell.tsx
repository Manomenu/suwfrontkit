import { useState, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { Tooltip } from "radix-ui";

import { cn } from "../classNames.js";
import { COLLAPSED_PANEL_WIDTH, HEADER_HEIGHT, PANEL_WIDTH, panelSideClasses } from "./layout.js";
import { PanelContext } from "./panelContext.js";
import { storeCollapsed, storedCollapsed } from "./panelPreference.js";

export function AppShell({
    appIcon,
    appTitle,
    home,
    headerEnd,
    panel,
    panelLabel,
    storageKey,
    side = "left",
    children,
}: {
    appIcon: ReactElement;
    appTitle: string;
    home: (link: { className: string; children: ReactNode }) => ReactNode;
    headerEnd?: ReactNode;
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
                className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background pr-4 pl-2.5"
                style={{ height: HEADER_HEIGHT }}
            >
                {home({
                    className:
                        "flex items-center gap-2.5 rounded-md pr-1 text-lg font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    children: (
                        <>
                            <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center *:size-full">
                                {appIcon}
                            </span>
                            <span>{appTitle}</span>
                        </>
                    ),
                })}
                <div className="ml-auto flex items-center gap-3">{headerEnd}</div>
            </header>
            <div className={cn("flex", classes.row)}>
                <aside
                    id="navigation-panel"
                    className={cn(
                        "sticky flex shrink-0 flex-col gap-1 overflow-x-hidden overflow-y-auto border-border bg-background p-1.5",
                        classes.border,
                    )}
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
                    <PanelContext value={{ collapsed, side }}>
                        <Tooltip.Provider delayDuration={150}>
                            <div className="flex min-h-0 flex-1 flex-col">{panel}</div>
                        </Tooltip.Provider>
                    </PanelContext>
                </aside>
                <main className="min-w-0 flex-1 p-4">{children}</main>
            </div>
        </div>
    );
}
