import { expect, it } from "vitest";

import { fileName, paths, read } from "./repository.ts";

function isScript(file: string): boolean {
    return (file.endsWith(".sh") || file.endsWith(".ts")) && (file.startsWith("scripts/") || file.startsWith("gate/scripts/"));
}

function calls(file: string): boolean {
    return (
        file.endsWith(".sh") ||
        file.endsWith(".just") ||
        ["justfile", "package.json", ".claude/settings.json", ".vscode/tasks.json"].includes(file) ||
        file.startsWith(".githooks/") ||
        file.startsWith(".github/workflows/")
    );
}

it("every script is called by a recipe, another script, a hook or the workflow", () => {
    const known = paths();
    const callers = known.filter(calls).map((file) => ({ file, text: read(file) }));

    const uncalled = known
        .filter(isScript)
        .filter((script) => !callers.some((caller) => caller.file !== script && caller.text.includes(fileName(script))))
        .sort();

    expect(uncalled, "nothing calls it: delete it, or call it from the recipe, script or hook that needs it").toEqual([]);
});
