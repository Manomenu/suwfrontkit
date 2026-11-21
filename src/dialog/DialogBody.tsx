import type { ReactNode } from "react";

import { bodyClassName, bodyContentClassName, useScrollingBody } from "./frame.js";

export function DialogBody({ children }: { children: ReactNode }) {
    const scrolling = useScrollingBody();
    return (
        <div data-slot="dialog-body" className={bodyClassName} {...scrolling}>
            <div className={bodyContentClassName}>{children}</div>
        </div>
    );
}
