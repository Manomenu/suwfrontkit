import { useCallback, useState } from "react";

import { cn } from "../classNames.js";

export const overlayClassName = "fixed inset-0 z-50 bg-backdrop";

export type DialogWidth = "default" | "wide";

export function contentClassName(width: DialogWidth) {
    return cn(
        "fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full -translate-x-1/2 -translate-y-1/2 flex-col gap-3 p-5 shadow-lg outline-none",
        width === "wide" ? "max-w-3xl" : "max-w-lg",
    );
}

export const titleClassName = "text-lg font-semibold wrap-anywhere";

export const bodyClassName = "-m-1 min-h-0 flex-1 overflow-y-auto p-1";

export const bodyContentClassName = "flex flex-col gap-3";

export function useScrollingBody() {
    const [scrolls, setScrolls] = useState(false);
    const ref = useCallback((body: HTMLDivElement | null) => {
        const content = body?.firstElementChild;
        if (body == null || content == null || typeof ResizeObserver === "undefined") return;
        const measure = () => {
            setScrolls(body.scrollHeight > body.clientHeight);
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(body);
        observer.observe(content);
        return () => {
            observer.disconnect();
        };
    }, []);
    return { ref, ...(scrolls && { tabIndex: 0 }) };
}

export const descriptionClassName = "text-sm text-muted-foreground";

export const actionsClassName = "mt-2 flex justify-end gap-2";

export function useReturnFocus(open: boolean) {
    const [opener, setOpener] = useState<HTMLElement | null>(null);
    const [wasOpen, setWasOpen] = useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) setOpener(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    }
    return (event: Event) => {
        event.preventDefault();
        opener?.focus();
    };
}
