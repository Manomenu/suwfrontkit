import { expect, it } from "vitest";

import { fileName, paths, read } from "./repository.ts";

const MOD_LINE = /^mod\s+([\w-]+)\s*$/gm;

function justFiles(): string[] {
    return paths().filter((file) => file.endsWith(".just"));
}

it("every module is beside the justfile or in its tool's folder as mod.just", () => {
    const misplaced = justFiles().filter((file) => file.includes("/") && (fileName(file) !== "mod.just" || file.split("/").length !== 2));

    expect(
        misplaced,
        "move it to <name>.just beside the justfile (a module of the whole repository) or to <folder>/mod.just (a tool's)",
    ).toEqual([]);
});

it("every mod line names a module that exists and every module is named", () => {
    const named = [...read("justfile").matchAll(MOD_LINE)].map((match) => match[1] ?? "");
    const files = justFiles();

    const missing = named.filter((name) => !files.includes(`${name}.just`) && !files.includes(`${name}/mod.just`));
    const orphans = files.filter(
        (file) => !named.includes(file.endsWith("/mod.just") ? (file.split("/")[0] ?? "") : fileName(file).replace(/\.just$/, "")),
    );

    expect(missing, "`mod <name>` finds <name>.just or <name>/mod.just only, with no path").toEqual([]);
    expect(orphans, "add `mod <name>` to the justfile, or delete the module").toEqual([]);
});
