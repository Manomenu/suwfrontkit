import { expect, it } from "vitest";

import { paths } from "./repository.ts";

const FIX =
    "name it after the component or after what it is (theme, appShell), not after who uses it or its kind; one component = one folder";

const FORBIDDEN = [
    "common",
    "components",
    "core",
    "helper",
    "helpers",
    "hooks",
    "lib",
    "manager",
    "misc",
    "shared",
    "stuff",
    "ui",
    "util",
    "utilities",
    "utility",
    "utils",
    "base",
];

export function forbiddenIn(name: string): string | undefined {
    const words = name.split(/(?=[A-Z])|[-_.]/).map((word) => word.toLowerCase());
    return FORBIDDEN.find((entry) => entry === name.toLowerCase() || words.includes(entry));
}

it.each([
    ["stringHelpers", "helpers"],
    ["utils", "utils"],
    ["ui", "ui"],
    ["Components", "components"],
    ["appShell", undefined],
    ["infoTip", undefined],
    ["building", undefined],
])("a forbidden word is found by its words, not by letters: %s", (name, expected) => {
    expect(forbiddenIn(name)).toBe(expected);
});

it("no folder or file is named by a forbidden word", () => {
    const names = new Set(
        paths()
            .filter((file) => !file.startsWith("docs/visual/") && !file.startsWith("visual/snapshots/"))
            .flatMap((file) => file.split("/"))
            .map((part) => part.replace(/\..*$/, "")),
    );

    const found = [...names]
        .map((name) => ({ name, word: forbiddenIn(name) }))
        .filter((item) => item.word !== undefined)
        .map((item) => `${item.name} (${String(item.word)})`)
        .sort();

    expect(found, FIX).toEqual([]);
});
