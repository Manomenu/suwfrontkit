import { describe, expect, it } from "vitest";

import { diffRows, foldRows, pairRows } from "./rows.js";

const lines = (count: number, prefix: string) => Array.from({ length: count }, (_, index) => `${prefix}${String(index)}\n`).join("");

describe("diffRows", () => {
    it("numbers the lines of each side", () => {
        expect(diffRows("a\nb\nc\n", "a\nx\nc\n")).toEqual([
            { change: "same", text: "a", before: 1, after: 1 },
            { change: "removed", text: "b", before: 2, after: null },
            { change: "added", text: "x", before: null, after: 2 },
            { change: "same", text: "c", before: 3, after: 3 },
        ]);
    });

    it("ignores a missing newline at the end and Windows line endings", () => {
        expect(diffRows("a\r\nb", "a\nb\n").every((row) => row.change === "same")).toBe(true);
    });

    it("shows a text written from nothing as added lines", () => {
        expect(diffRows("", "one\ntwo").map((row) => [row.change, row.after])).toEqual([
            ["added", 1],
            ["added", 2],
        ]);
    });
});

describe("foldRows", () => {
    it("keeps the context around a change and folds the rest of a long unchanged run", () => {
        const rows = diffRows(`${lines(10, "top")}old\n${lines(10, "bottom")}`, `${lines(10, "top")}new\n${lines(10, "bottom")}`);
        const blocks = foldRows(rows, 3);

        expect(blocks.map((block) => [block.folded, block.rows.length])).toEqual([
            [true, 7],
            [false, 3],
            [false, 2],
            [false, 3],
            [true, 7],
        ]);
        expect(blocks[1]?.rows.map((row) => row.text)).toEqual(["top7", "top8", "top9"]);
    });

    it("never folds a single line, and folds nothing with an infinite context", () => {
        const make = (middle: number, context: number) =>
            foldRows(diffRows(`x\n${lines(middle, "m")}y\n`, `X\n${lines(middle, "m")}Y\n`), context);

        expect(make(7, 3).some((block) => block.folded)).toBe(false);
        expect(
            make(8, 3)
                .filter((block) => block.folded)
                .map((block) => block.rows.length),
        ).toEqual([2]);
        expect(make(100, Infinity).some((block) => block.folded)).toBe(false);
    });
});

describe("pairRows", () => {
    it("puts each removed line beside the added line that took its place, and a blank beside the rest", () => {
        const pairs = pairRows(diffRows("a\nb\nc\nd\n", "a\nB\nd\ne\n"));

        expect(pairs.map((pair) => [pair.before?.text ?? null, pair.after?.text ?? null])).toEqual([
            ["a", "a"],
            ["b", "B"],
            ["c", null],
            ["d", "d"],
            [null, "e"],
        ]);
    });
});
