import * as React from "react";

import { cn } from "../classNames.js";

export function Page({
    title,
    width = "full",
    actions,
    titleAside,
    children,
}: {
    title: string;
    width?: "full" | "reading";
    actions?: React.ReactNode;
    titleAside?: React.ReactNode;
    children?: React.ReactNode;
}) {
    return (
        <div data-width={width} className={cn("flex flex-col gap-4", width === "reading" && "max-w-reading")}>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2">
                    <h1 className="text-[26px] leading-[1.35] font-bold wrap-anywhere">{title}</h1>
                    {titleAside}
                </div>
                {actions !== undefined && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
            {children}
        </div>
    );
}
