import type { ReactNode } from "react";

export function GraphicSplit({ graphic, children }: { graphic?: ReactNode; children: ReactNode }) {
    if (graphic === null || graphic === undefined || graphic === false) {
        return <div className="flex min-w-0 flex-col gap-4">{children}</div>;
    }
    return (
        <div className="grid grid-cols-2 items-start gap-4">
            <div data-column="data" className="flex min-w-0 flex-col gap-4">
                {children}
            </div>
            <div
                data-column="graphic"
                className="sticky top-[calc(var(--header-height,0px)+1rem)] flex h-[calc(100vh-var(--header-height,0px)-2rem)] min-w-0 flex-col gap-4"
            >
                {graphic}
            </div>
        </div>
    );
}
