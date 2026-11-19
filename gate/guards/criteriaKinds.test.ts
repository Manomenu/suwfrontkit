import { expect, it } from "vitest";

import { read } from "./repository.ts";

it("every kind of guardrail of criteria.json is explained in docs/development.md", () => {
    const kinds = (JSON.parse(read("gate/criteria.json")) as { kinds: { kind: string }[] }).kinds.map((kind) => kind.kind);
    const text = read("docs/development.md");

    expect(kinds.length).toBeGreaterThan(0);
    expect(
        kinds.filter(
            (kind) => !text.split("\n").some((line) => line.replace(/\s+\|/g, " |").replace(/\|\s+/g, "| ").includes(`| \`${kind}\` |`)),
        ),
        "docs/development.md has no row for these kinds of guardrail of gate/criteria.json: add `| `<kind>` | where | how it names the id |` to its table",
    ).toEqual([]);
});
