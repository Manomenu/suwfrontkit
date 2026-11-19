import { expect, it } from "vitest";

import { read } from "./repository.ts";

const MAX_LINES = 100;

const ACRONYMS = new Set(["AGENTS", "CLAUDE", "CSS", "FAIL", "HTML", "JSON", "KISS", "PASS", "README", "SKIP", "TODO", "YAGNI", "YAML"]);

it("AGENTS.md stays short enough to be read every session", () => {
    const lines = read("AGENTS.md").split("\n").length - 1;

    expect(
        lines,
        `AGENTS.md has ${lines} lines, the limit is ${MAX_LINES}: move detail to docs/, or make the rule a type, lint, test or hook instead`,
    ).toBeLessThanOrEqual(MAX_LINES);
});

it("AGENTS.md has no directory tree", () => {
    expect(
        /[├└│]/.test(read("AGENTS.md")),
        "AGENTS.md must not draw a directory tree: it goes stale. Put the map in docs/architecture.md (repositoryLayout.test.ts reads it)",
    ).toBe(false);
});

it("AGENTS.md does not shout", () => {
    const shouted = [...new Set(read("AGENTS.md").match(/\b[A-Z]{4,}\b/g) ?? [])].filter((word) => !ACRONYMS.has(word)).sort();

    expect(
        shouted,
        "write it in plain case and give the reason instead of capitals, or add a real acronym to ACRONYMS in gate/guards/agentsFile.test.ts",
    ).toEqual([]);
});

it("CLAUDE.md only points to AGENTS.md", () => {
    expect(read("CLAUDE.md").trim(), "CLAUDE.md must contain exactly `@AGENTS.md`: edit AGENTS.md, never CLAUDE.md").toBe("@AGENTS.md");
});
