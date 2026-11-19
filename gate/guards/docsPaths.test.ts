import { expect, it } from "vitest";

import { paths, read } from "./repository.ts";

const NOT_IN_THE_REPOSITORY = new Set(["CLAUDE.local.md", "dist/", "storybook-static/"]);
const MENTION = /`([\w.\-/@]+)`|\]\(([\w.\-/]+)(?:#[\w-]*)?\)/g;
const FILE_NAME = /\.(css|json|md|sh|ts|tsx|txt|yaml|yml)$/;

function isPath(mention: string): boolean {
    return (
        !mention.startsWith("http") &&
        !mention.startsWith("/") &&
        !mention.startsWith("@") &&
        (mention.includes("/") || FILE_NAME.test(mention))
    );
}

function exists(mention: string, known: string[]): boolean {
    const folder = `${mention.replace(/\/+$/, "")}/`;
    return known.some((file) => file === mention || file.startsWith(folder) || file.endsWith(`/${mention}`) || file.includes(`/${folder}`));
}

it("every file and folder the docs mention exists", () => {
    const known = paths();
    const stale = known
        .filter((file) => file.endsWith(".md") && !file.startsWith("docs/visual/") && !file.startsWith(".changeset/"))
        .flatMap((document) =>
            [...read(document).matchAll(MENTION)]
                .map((match) => match[1] ?? match[2] ?? "")
                .filter((mention) => isPath(mention) && !NOT_IN_THE_REPOSITORY.has(mention) && !exists(mention, known))
                .map((mention) => `${document}: ${mention}`),
        );

    expect(
        [...new Set(stale)].sort(),
        "the docs name paths that do not exist: say what the code does instead of where it is, or fix the path",
    ).toEqual([]);
});
