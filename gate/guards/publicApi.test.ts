import { expect, it } from "vitest";

import { paths, read } from "./repository.ts";

const NOT_A_COMPONENT = new Set(["theme"]);

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

it("every component folder is exported from src/index.ts", () => {
    const index = read("src/index.ts");

    expect(
        componentFolders().filter((folder) => !index.includes(`from "./${folder}/`)),
        "export the component from src/index.ts, or delete the folder: a folder nobody can import is dead code",
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
