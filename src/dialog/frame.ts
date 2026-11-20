import { useState } from "react";

export const overlayClassName = "fixed inset-0 z-50 bg-backdrop";

export const contentClassName =
    "fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-3 overflow-y-auto p-5 shadow-lg outline-none";

export const titleClassName = "text-lg font-semibold wrap-anywhere";

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
