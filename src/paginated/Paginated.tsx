import { useRef, type ReactNode } from "react";

import { Alert } from "../alert/Alert.js";
import { Button } from "../button/Button.js";
import { cn } from "../classNames.js";

export interface Paging {
    page: number;
    pages: number;
    asking: boolean;
    failure: string | null;
    onMove: (page: number) => void;
}

export function Paginated({ paging, children }: { paging: Paging; children: ReactNode }) {
    const top = useRef<HTMLDivElement>(null);
    if (paging.failure !== null) return <Alert variant="destructive">{paging.failure}</Alert>;
    if (paging.asking) return <p className="text-muted-foreground">Loading…</p>;
    const { page, pages, onMove } = paging;
    const move = (to: number) => {
        top.current?.scrollIntoView({ block: "start" });
        onMove(to);
    };
    const alone = pages <= 1;
    return (
        <div ref={top} className="flex scroll-mt-20 flex-col gap-2">
            {children}
            <div
                role="group"
                aria-label="Pages"
                aria-hidden={alone}
                className={cn("flex items-center justify-center gap-3 text-sm", alone && "invisible")}
            >
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => {
                        move(page - 1);
                    }}
                >
                    Previous
                </Button>
                <span>{`Page ${page} of ${pages}`}</span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= pages}
                    onClick={() => {
                        move(page + 1);
                    }}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
