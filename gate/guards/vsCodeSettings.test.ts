import { expect, it } from "vitest";

import { read } from "./repository.ts";

const TOOL_PATHS = new Set(["prettier.prettierPath", "prettier.configPath", "prettier.ignorePath", "prettier.requireConfig"]);
const STYLE_KEY =
    /^(editor\.(tabSize|insertSpaces|detectIndentation|rulers|wordWrap|wordWrapColumn|trimAutoWhitespace|renderWhitespace)|files\.(eol|insertFinalNewline|trimFinalNewlines|trimTrailingWhitespace|encoding|autoGuessEncoding)|prettier\..*)$/;
const EXTENSION_ID = /^[a-z0-9][a-z0-9-]*\.[a-z0-9][a-z0-9-]*$/;

function isStyle(key: string): boolean {
    return STYLE_KEY.test(key) && !TOOL_PATHS.has(key);
}

function keys(value: Record<string, unknown>): string[] {
    return Object.entries(value).flatMap(([key, inner]) =>
        key.startsWith("[") && typeof inner === "object" && inner !== null ? [key, ...keys(inner as Record<string, unknown>)] : [key],
    );
}

it("settings.json holds glue and no style rules", () => {
    const settings = JSON.parse(read(".vscode/settings.json")) as Record<string, unknown>;

    expect(keys(settings).filter(isStyle).sort(), "put it in .editorconfig or .prettierrc.json so every editor uses it").toEqual([]);
});

it.each([
    ["editor.tabSize", true],
    ["files.eol", true],
    ["prettier.printWidth", true],
    ["prettier.prettierPath", false],
    ["editor.formatOnSave", false],
])("the style rule judges %s", (key, expected) => {
    expect(isStyle(key)).toBe(expected);
});

it("every recommended extension id is well formed and listed once", () => {
    const ids = (JSON.parse(read(".vscode/extensions.json")) as { recommendations: string[] }).recommendations;

    const bad = [...ids.filter((id) => !EXTENSION_ID.test(id)), ...ids.filter((id, index) => ids.indexOf(id) !== index)];

    expect(bad, "write each id as publisher.name in lower case, once (the Marketplace id from the extension page)").toEqual([]);
});
