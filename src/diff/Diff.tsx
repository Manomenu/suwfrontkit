import { useMemo, useState } from "react";

import { cn } from "../classNames.js";
import { diffRows, foldRows, pairRows, type Block, type Change, type Row } from "./rows.js";

export interface DiffLabels {
    before: string;
    after: string;
    identical: string;
    added: string;
    removed: string;
    folded: (count: number) => string;
}

const ENGLISH: DiffLabels = {
    before: "Before",
    after: "After",
    identical: "The texts are identical.",
    added: "Added",
    removed: "Removed",
    folded: (count) => `Show ${String(count)} unchanged ${count === 1 ? "line" : "lines"}`,
};

const BACKGROUNDS: Record<Change, string> = { same: "", added: "bg-success-light", removed: "bg-destructive-light" };
const MARKERS: Record<Change, string> = { same: " ", added: "+", removed: "−" };
const MARKER_COLORS: Record<Change, string> = { same: "", added: "text-success", removed: "text-destructive" };

const COLUMNS = 4;
const NUMBER = "w-px px-2 text-right align-top whitespace-nowrap text-muted-foreground select-none";
const TEXT = "px-2 align-top whitespace-pre-wrap wrap-anywhere";

function Said({ row, labels }: { row: Row; labels: DiffLabels }) {
    const said = row.change === "added" ? labels.added : row.change === "removed" ? labels.removed : null;
    return (
        <>
            {said !== null && <span className="sr-only">{`${said}: `}</span>}
            {row.text}
        </>
    );
}

function UnifiedRow({ row, labels }: { row: Row; labels: DiffLabels }) {
    return (
        <tr data-change={row.change} className={BACKGROUNDS[row.change]}>
            <td className={NUMBER}>{row.before}</td>
            <td className={NUMBER}>{row.after}</td>
            <td aria-hidden="true" className={cn("w-px pl-1 align-top select-none", MARKER_COLORS[row.change])}>
                {MARKERS[row.change]}
            </td>
            <td className={TEXT}>
                <Said row={row} labels={labels} />
            </td>
        </tr>
    );
}

function Side({ row, line, labels }: { row: Row | null; line: number | null; labels: DiffLabels }) {
    if (row === null) {
        return (
            <>
                <td className={cn(NUMBER, "bg-muted/50")} />
                <td className={cn(TEXT, "bg-muted/50")} />
            </>
        );
    }
    return (
        <>
            <td data-change={row.change} className={cn(NUMBER, BACKGROUNDS[row.change])}>
                {line}
            </td>
            <td data-change={row.change} className={cn(TEXT, BACKGROUNDS[row.change])}>
                <Said row={row} labels={labels} />
            </td>
        </>
    );
}

function rowsOf(rows: Row[], view: "unified" | "split", labels: DiffLabels) {
    if (view === "unified")
        return rows.map((row) => <UnifiedRow key={`${String(row.before)}-${String(row.after)}`} row={row} labels={labels} />);
    return pairRows(rows).map((pair) => (
        <tr key={`${String(pair.before?.before)}-${String(pair.after?.after)}`}>
            <Side row={pair.before} line={pair.before?.before ?? null} labels={labels} />
            <Side row={pair.after} line={pair.after?.after ?? null} labels={labels} />
        </tr>
    ));
}

export function Diff({
    before,
    after,
    view = "unified",
    context = 3,
    labels,
    className,
}: {
    before: string;
    after: string;
    view?: "unified" | "split";
    context?: number;
    labels?: Partial<DiffLabels>;
    className?: string;
}) {
    const said = { ...ENGLISH, ...labels };
    const rows = useMemo(() => diffRows(before, after), [before, after]);
    const blocks = useMemo(() => foldRows(rows, context), [rows, context]);
    const [opened, setOpened] = useState<{ of: Block[]; blocks: ReadonlySet<number> }>({ of: blocks, blocks: new Set() });
    const open = opened.of === blocks ? opened.blocks : new Set<number>();

    if (rows.every((row) => row.change === "same")) return <p className="text-sm text-muted-foreground">{said.identical}</p>;
    return (
        <div className={cn("overflow-auto rounded-lg border border-border", className)}>
            <table className="w-full border-collapse font-mono text-xs leading-5">
                {view === "split" && (
                    <thead>
                        <tr className="border-b border-border text-left font-sans text-muted-foreground">
                            <th colSpan={2} className="w-1/2 px-2 py-1 font-semibold">
                                {said.before}
                            </th>
                            <th colSpan={2} className="w-1/2 px-2 py-1 font-semibold">
                                {said.after}
                            </th>
                        </tr>
                    </thead>
                )}
                <tbody>
                    {blocks.map((block, index) =>
                        block.folded && !open.has(index) ? (
                            <tr key={`folded-${String(index)}`}>
                                <td colSpan={COLUMNS} className="p-0">
                                    <button
                                        type="button"
                                        className="w-full cursor-pointer bg-muted/50 px-2 py-1 text-left font-sans text-muted-foreground hover:bg-accent/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        onClick={() => {
                                            setOpened({ of: blocks, blocks: new Set(open).add(index) });
                                        }}
                                    >
                                        {said.folded(block.rows.length)}
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            rowsOf(block.rows, view, said)
                        ),
                    )}
                </tbody>
            </table>
        </div>
    );
}
