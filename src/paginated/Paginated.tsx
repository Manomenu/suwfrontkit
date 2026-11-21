import { useRef, type ReactNode } from "react";

import { Alert } from "../alert/Alert.js";
import { Button } from "../button/Button.js";
import { cn } from "../classNames.js";
import { Spinner } from "../spinner/Spinner.js";

export interface Paging {
    page: number;
    pages: number;
    hasNext?: boolean;
    asking: boolean;
    failure: string | null;
    onMove: (page: number) => void;
}

export interface PagingLabels {
    pages: string;
    previous: string;
    next: string;
    loading: string;
    page: (page: number, pages: number | null) => string;
}

const ENGLISH_PAGING: PagingLabels = {
    pages: "Pages",
    previous: "Previous",
    next: "Next",
    loading: "Loading…",
    page: (page, pages) => (pages === null ? `Page ${String(page)}` : `Page ${String(page)} of ${String(pages)}`),
};

export function Paginated({ paging, labels, children }: { paging: Paging; labels?: Partial<PagingLabels>; children: ReactNode }) {
    const top = useRef<HTMLDivElement>(null);
    const said = { ...ENGLISH_PAGING, ...labels };
    if (paging.failure !== null) return <Alert variant="destructive">{paging.failure}</Alert>;
    if (paging.asking) return <Spinner size="sm" label={said.loading} />;
    const { page, pages, hasNext, onMove } = paging;
    const move = (to: number) => {
        top.current?.scrollIntoView({ block: "start" });
        onMove(to);
    };
    const last = hasNext === undefined ? page >= pages : !hasNext;
    const alone = page <= 1 && last;
    return (
        <div ref={top} className="flex scroll-mt-20 flex-col gap-2">
            {children}
            <div
                role="group"
                aria-label={said.pages}
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
                    {said.previous}
                </Button>
                <span>{said.page(page, hasNext === undefined ? pages : null)}</span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={last}
                    onClick={() => {
                        move(page + 1);
                    }}
                >
                    {said.next}
                </Button>
            </div>
        </div>
    );
}
