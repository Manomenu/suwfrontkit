import { expect, it } from "vitest";

import { paths } from "./repository.ts";

const builtName = (file: string) => file.toLowerCase().replace(/\.(ts|tsx|js|jsx)$/, ".js");

it("no two files differ only in the case of their names, also once tsc has emitted them as .js", () => {
    const byName = new Map<string, string[]>();
    for (const file of paths()) byName.set(builtName(file), [...(byName.get(builtName(file)) ?? []), file]);
    const clashes = [...byName.values()].filter((files) => files.length > 1);

    expect(
        clashes,
        "rename one of each pair: a bundler that ignores case (esbuild in Vite's dev server, a macOS or Windows disk) takes one file for the other, e.g. dist/appShell/NavTree.js for navTree.js",
    ).toEqual([]);
});
