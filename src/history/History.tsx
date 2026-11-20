import { useState, type ReactNode } from "react";

import { cn } from "../classNames.js";
import { Paginated, type Paging, type PagingLabels } from "../paginated/Paginated.js";
import { isAlone, pageOf } from "./pageOf.js";

export interface HistoryEntry {
    id: string;
    at: Date | string;
    who: string;
    what: ReactNode;
    details?: ReactNode;
    actions?: ReactNode;
}

export interface HistoryLabels extends PagingLabels {
    list: string;
    empty: string;
    details: string;
}

const ENGLISH: Pick<HistoryLabels, "list" | "empty" | "details"> = {
    list: "History",
    empty: "No change has been recorded yet.",
    details: "Details",
};

function Entries({ entries, said, dates }: { entries: HistoryEntry[]; said: typeof ENGLISH; dates: Intl.DateTimeFormat }) {
    if (entries.length === 0) return <p className="text-sm text-muted-foreground">{said.empty}</p>;
    return (
        <ol aria-label={said.list} className="flex flex-col">
            {entries.map((entry) => {
                const at = new Date(entry.at);
                return (
                    <li key={entry.id} className="flex flex-col gap-1 border-b border-border py-2 first:pt-0 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                                <time dateTime={at.toISOString()} className="whitespace-nowrap text-muted-foreground">
                                    {dates.format(at)}
                                </time>
                                <span className="font-semibold">{entry.who}</span>
                                <span className="min-w-0 wrap-break-word">{entry.what}</span>
                            </div>
                            {entry.actions !== undefined && <div className="flex shrink-0 items-center gap-2">{entry.actions}</div>}
                        </div>
                        {entry.details !== undefined && (
                            <details className="text-sm">
                                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">{said.details}</summary>
                                <div className="flex flex-col gap-1 pt-1 pl-4">{entry.details}</div>
                            </details>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

export function History({
    entries,
    pageSize = 20,
    page,
    onPageChange,
    total,
    hasNext,
    loading = false,
    failure = null,
    labels,
    locale,
    timeZone,
    className,
}: {
    entries: HistoryEntry[];
    pageSize?: number;
    page?: number;
    onPageChange?: (page: number) => void;
    total?: number;
    hasNext?: boolean;
    loading?: boolean;
    failure?: string | null;
    labels?: Partial<HistoryLabels>;
    locale?: string;
    timeZone?: string;
    className?: string;
}) {
    const [ownPage, setOwnPage] = useState(1);
    const said = { ...ENGLISH, ...labels };
    const shown = pageOf(entries, page ?? ownPage, pageSize, { total, hasNext });
    const paging: Paging = {
        page: shown.page,
        pages: shown.pages,
        ...(shown.hasNext === undefined ? {} : { hasNext: shown.hasNext }),
        asking: loading,
        failure,
        onMove: (to) => {
            if (page === undefined) setOwnPage(to);
            onPageChange?.(to);
        },
    };
    const dates = new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        ...(timeZone === undefined ? {} : { timeZone }),
    });
    const list = <Entries entries={shown.entries} said={said} dates={dates} />;
    const busy = loading || failure !== null;
    return (
        <div className={cn("flex flex-col", className)}>
            {!busy && isAlone(shown) ? (
                list
            ) : (
                <Paginated paging={paging} {...(labels === undefined ? {} : { labels })}>
                    {list}
                </Paginated>
            )}
        </div>
    );
}
