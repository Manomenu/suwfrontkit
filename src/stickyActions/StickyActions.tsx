import type { ReactNode } from "react";

export function StickyActions({ children }: { children: ReactNode }) {
    return <div className="sticky bottom-0 z-10 flex items-center gap-2 border-t border-border bg-card py-2">{children}</div>;
}
