import { diffLines } from "diff";

export type Change = "same" | "added" | "removed";

export interface Row {
    change: Change;
    text: string;
    before: number | null;
    after: number | null;
}

export interface Block {
    folded: boolean;
    rows: Row[];
}

export interface Pair {
    before: Row | null;
    after: Row | null;
}

function linesOf(value: string): string[] {
    const lines = value.split("\n");
    if (lines.at(-1) === "") lines.pop();
    return lines;
}

export function diffRows(before: string, after: string): Row[] {
    const rows: Row[] = [];
    let beforeLine = 1;
    let afterLine = 1;
    for (const part of diffLines(before, after, { ignoreNewlineAtEof: true, stripTrailingCr: true })) {
        for (const text of linesOf(part.value)) {
            if (part.added) rows.push({ change: "added", text, before: null, after: afterLine++ });
            else if (part.removed) rows.push({ change: "removed", text, before: beforeLine++, after: null });
            else rows.push({ change: "same", text, before: beforeLine++, after: afterLine++ });
        }
    }
    return rows;
}

export function foldRows(rows: Row[], context: number): Block[] {
    const blocks: Block[] = [];
    let index = 0;
    while (index < rows.length) {
        const start = index;
        const same = rows[index]?.change === "same";
        while (index < rows.length && (rows[index]?.change === "same") === same) index++;
        const run = rows.slice(start, index);
        const keepBefore = start === 0 ? 0 : context;
        const keepAfter = index === rows.length ? 0 : context;
        if (!same || run.length - keepBefore - keepAfter < 2) {
            blocks.push({ folded: false, rows: run });
            continue;
        }
        if (keepBefore > 0) blocks.push({ folded: false, rows: run.slice(0, keepBefore) });
        blocks.push({ folded: true, rows: run.slice(keepBefore, run.length - keepAfter) });
        if (keepAfter > 0) blocks.push({ folded: false, rows: run.slice(run.length - keepAfter) });
    }
    return blocks;
}

export function pairRows(rows: Row[]): Pair[] {
    const pairs: Pair[] = [];
    let removed: Row[] = [];
    let added: Row[] = [];
    const flush = () => {
        for (let index = 0; index < Math.max(removed.length, added.length); index++) {
            pairs.push({ before: removed[index] ?? null, after: added[index] ?? null });
        }
        removed = [];
        added = [];
    };
    for (const row of rows) {
        if (row.change === "removed") removed.push(row);
        else if (row.change === "added") added.push(row);
        else {
            flush();
            pairs.push({ before: row, after: row });
        }
    }
    flush();
    return pairs;
}
