import { expect, it } from "vitest";

import { paths, read } from "./repository.ts";

const NOT_A_COMPONENT = new Set(["theme"]);

function entryPointFolders(): string[] {
    const manifest = JSON.parse(read("package.json")) as { exports: Record<string, string | { types?: string }> };
    return Object.values(manifest.exports).flatMap((target) => {
        const folder = typeof target === "string" ? undefined : /^\.\/dist\/([^/]+)\/index\.d\.ts$/.exec(target.types ?? "")?.[1];
        return folder === undefined ? [] : [folder];
    });
}

function componentFolders(): string[] {
    return [
        ...new Set(
            paths()
                .filter((file) => /^src\/[^/]+\/[^/]+$/.test(file))
                .map((file) => file.split("/")[1] ?? ""),
        ),
    ]
        .filter((folder) => !NOT_A_COMPONENT.has(folder))
        .sort();
}

it("every component folder is exported from src/index.ts or is an entry point of its own in package.json", () => {
    const index = read("src/index.ts");
    const entryPoints = entryPointFolders();

    expect(
        componentFolders().filter((folder) => !index.includes(`from "./${folder}/`) && !entryPoints.includes(folder)),
        "export the component from src/index.ts (or, for a component with a heavy optional peer, from src/<folder>/index.ts named in the exports of package.json), or delete the folder: a folder nobody can import is dead code",
    ).toEqual([]);
});

it("every component folder has a story and a test", () => {
    const files = paths();
    const missing = componentFolders().flatMap((folder) => {
        const inFolder = files.filter((file) => file.startsWith(`src/${folder}/`));
        return [
            ...(inFolder.some((file) => file.endsWith(".stories.tsx")) ? [] : [`src/${folder}/: a story (*.stories.tsx)`]),
            ...(inFolder.some((file) => /\.test\.tsx?$/.test(file)) ? [] : [`src/${folder}/: a test (*.test.tsx)`]),
        ];
    });

    expect(missing, "add what is missing: a story shows each state and runs as a test with axe, a test proves the behaviour").toEqual([]);
});

it("src/index.ts exports only from component folders and the shared modules", () => {
    const sources = [...read("src/index.ts").matchAll(/from "\.\/([^"]+)"/g)].map((match) => match[1] ?? "");
    const folders = componentFolders();

    expect(
        sources.filter((source) => source !== "classNames.js" && !folders.includes(source.split("/")[0] ?? "")),
        "export a component from its own folder",
    ).toEqual([]);
});
