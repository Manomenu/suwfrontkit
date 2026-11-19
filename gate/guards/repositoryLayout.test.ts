import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import { expect, it } from "vitest";

import { paths, read, ROOT } from "./repository.ts";

const MAP = "docs/architecture.md";
const MAX_MAP_LINE_LENGTH = 300;
const MAP_ENTRY = /^- `([^`]+)`/;

function mapLines(): string[] {
    return read(MAP)
        .split("\n")
        .filter((line) => MAP_ENTRY.test(line));
}

it("every top-level folder is in the map of architecture.md", () => {
    const folders = new Set(
        paths()
            .filter((file) => file.includes("/"))
            .map((file) => file.split("/")[0] ?? ""),
    );
    const described = new Set(mapLines().map((line) => (MAP_ENTRY.exec(line)?.[1] ?? "").split("/")[0] ?? ""));

    const missing = [...folders].filter((folder) => !described.has(folder)).sort();
    const stale = [...described].filter((entry) => !folders.has(entry) && !existsSync(path.join(ROOT, entry))).sort();

    expect(missing, `add a line to the map in ${MAP} (- \`folder/\` - what it holds) for these`).toEqual([]);
    expect(stale, `the map in ${MAP} names paths that do not exist: delete their lines`).toEqual([]);
});

it("every line of the map is short", () => {
    const tooLong = mapLines()
        .filter((line) => line.length > MAX_MAP_LINE_LENGTH)
        .map((line) => line.slice(0, 40));

    expect(tooLong, `shorten these lines of the map in ${MAP} to ${MAX_MAP_LINE_LENGTH} characters`).toEqual([]);
});

it("no two files differ only in letter case", () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const file of paths()) {
        const other = seen.get(file.toLowerCase());
        if (other !== undefined) clashes.push(`${other} vs ${file}`);
        seen.set(file.toLowerCase(), file);
    }

    expect(clashes, "rename one of each pair (Windows and macOS ignore case)").toEqual([]);
});

it("every shell script is executable in git", () => {
    const notExecutable = execFileSync("git", ["ls-files", "--stage", "--", "*.sh", ".githooks/*"], { cwd: ROOT, encoding: "utf8" })
        .split("\n")
        .filter((line) => line.length > 0 && !line.startsWith("100755"))
        .map((line) => line.split("\t")[1]);

    expect(notExecutable, "make them executable: git update-index --chmod=+x <file>").toEqual([]);
});
