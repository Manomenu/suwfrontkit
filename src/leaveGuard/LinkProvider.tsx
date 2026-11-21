import { createContext, use, type MouseEvent, type ReactNode } from "react";

import { mayLeave } from "./leaveGuard.js";

type Navigate = (href: string) => void;

const NavigateContext = createContext<Navigate | null>(null);

export function LinkProvider({ navigate, children }: { navigate: Navigate; children: ReactNode }) {
    return <NavigateContext value={navigate}>{children}</NavigateContext>;
}

function opensElsewhere(event: MouseEvent<HTMLAnchorElement>): boolean {
    const { target } = event.currentTarget;
    return (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        (target !== "" && target !== "_self") ||
        event.currentTarget.hasAttribute("download")
    );
}

function isAppPath(href: string | null): href is string {
    return href !== null && href.startsWith("/") && !href.startsWith("//");
}

export function useLinkClick(onClick: ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined) {
    const navigate = use(NavigateContext);
    return (event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (navigate === null || event.defaultPrevented || opensElsewhere(event)) return;
        const href = event.currentTarget.getAttribute("href");
        if (!isAppPath(href)) return;
        event.preventDefault();
        if (mayLeave()) navigate(href);
    };
}
