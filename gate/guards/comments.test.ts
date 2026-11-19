import path from "node:path";

import { ESLint } from "eslint";
import { expect, it } from "vitest";

import { CRITERION_ID, FIX, isScanned, scan, shown, type FoundComment } from "./comments.ts";
import { fileName, paths, read, ROOT } from "./repository.ts";

const WHOLE_LINE_ONLY = new Set([".gitignore", ".gitattributes", ".prettierignore", ".editorconfig"]);
const ALSO_AT_THE_END_OF_A_LINE = [".sh", ".yaml", ".yml"];
const SHELLCHECK_DIRECTIVE = /^# shellcheck (disable|enable|source|shell|external-sources)=\S+$/;
const JSON_CRITERION = new RegExp(`^// ${CRITERION_ID}$`);
const MARKUP = [".html", ".svg", ".xml"];
const RECIPE_OR_MODULE = /^(@?[A-Za-z_][\w-]*(\s+[^:=]*)?:(?!=)|mod\s+[\w-]+\s*$)/;

const isJust = (file: string) => fileName(file) === "justfile" || file.endsWith(".just");
const isShell = (file: string) => file.endsWith(".sh") || file.startsWith(".githooks/");
const alsoAtTheEnd = (file: string) => isShell(file) || ALSO_AT_THE_END_OF_A_LINE.some((extension) => file.endsWith(extension));
const usesHashComments = (file: string) => isJust(file) || WHOLE_LINE_ONLY.has(fileName(file)) || alsoAtTheEnd(file);

function commentAtTheEnd(line: string): string | null {
    let quote = "";
    for (let at = 0; at < line.length; at++) {
        const sign = line.charAt(at);
        if (quote !== "") {
            if (sign === "\\" && quote === '"') at++;
            else if (sign === quote) quote = "";
        } else if (sign === '"' || sign === "'") {
            quote = sign;
        } else if (sign === "#" && at > 0 && /\s/.test(line.charAt(at - 1))) {
            return line.slice(at).trimEnd();
        }
    }
    return null;
}

function commentOn(file: string, line: string): string | null {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("#") || (fileName(file) === ".editorconfig" && trimmed.startsWith(";"))) return trimmed.trimEnd();
    return alsoAtTheEnd(file) ? commentAtTheEnd(line) : null;
}

function describesTheRecipeBelow(lines: string[], index: number): boolean {
    let next = index + 1;
    while (next < lines.length && (lines[next] ?? "").startsWith("[") && !(lines[next] ?? "").startsWith("[private]")) next++;
    return next < lines.length && RECIPE_OR_MODULE.test(lines[next] ?? "");
}

function isAllowed(file: string, lines: string[], index: number, comment: string): boolean {
    return (
        (index === 0 && comment.startsWith("#!")) ||
        (isShell(file) && SHELLCHECK_DIRECTIVE.test(comment)) ||
        (isJust(file) && describesTheRecipeBelow(lines, index))
    );
}

export function hashCommentsIn(file: string, text: string): FoundComment[] {
    const lines = text.split("\n");
    return lines.flatMap((line, index) => {
        const comment = commentOn(file, line);
        return comment !== null && !isAllowed(file, lines, index, comment) ? [{ line: index + 1, text: comment }] : [];
    });
}

export function cssCommentsIn(text: string): FoundComment[] {
    return scan(text, null, "'\"");
}

export function jsonCommentsIn(file: string, text: string): FoundComment[] {
    const readsCriterionMarkers = /^tsconfig[\w.]*\.json$/.test(file);
    return scan(text, "//", '"').filter((comment) => !(readsCriterionMarkers && JSON_CRITERION.test(comment.text)));
}

export function htmlCommentsIn(text: string): FoundComment[] {
    return scan(text, null, "", "<!--", "-->");
}

function assertNone(files: string[], commentsIn: (file: string, text: string) => FoundComment[]): void {
    const found = files.flatMap((file) => commentsIn(file, read(file)).map((comment) => `${file}:${comment.line}: ${shown(comment)}`));
    expect(found, FIX).toEqual([]);
}

const scanned = () => paths().filter(isScanned);

it("no shell, YAML, ignore, editorconfig or just file holds a comment but a tool directive", () => {
    assertNone(scanned().filter(usesHashComments), hashCommentsIn);
});

it("no CSS file holds a comment", () => {
    assertNone(
        scanned().filter((file) => file.endsWith(".css")),
        (_, text) => cssCommentsIn(text),
    );
});

it("no JSON file holds a comment but a criterion marker in a tsconfig", () => {
    assertNone(
        scanned().filter((file) => file.endsWith(".json") || file.endsWith(".jsonc")),
        jsonCommentsIn,
    );
});

it("no HTML, SVG or XML file holds a comment", () => {
    assertNone(
        scanned().filter((file) => MARKUP.some((extension) => file.endsWith(extension))),
        (_, text) => htmlCommentsIn(text),
    );
});

it.each([
    "export const noComments = {",
    "context.sourceCode.getAllComments()",
    'files: ["**/*.{ts,tsx,js,mjs,cjs}"],',
    'plugins: { local: { rules: { "no-comments": noComments } } },',
    'rules: { "local/no-comments": "error" },',
])("eslint refuses every comment in TypeScript and JavaScript but a tool directive: %s", (line) => {
    expect(
        read("eslint.config.js").includes(line),
        "eslint.config.js must keep the local no-comments rule switched on as an error for every TypeScript and JavaScript file (its examples are eslint.config.test.js)",
    ).toBe(true);
});

it("eslint ignores no TypeScript or JavaScript file of the repository", async () => {
    const eslint = new ESLint({ cwd: ROOT });
    const code = scanned().filter((file) => /\.(ts|tsx|js|mjs|cjs)$/.test(file));
    const ignored = await Promise.all(code.map(async (file) => ((await eslint.isPathIgnored(path.join(ROOT, file))) ? [file] : [])));

    expect(
        ignored.flat(),
        "a file eslint ignores escapes the no-comments rule: take it out of the ignores of eslint.config.js (a file outside the tsconfig projects goes into the block that extends disableTypeChecked)",
    ).toEqual([]);
});

it("the lint step of the gate lints the whole repository", () => {
    expect(read("gate/scripts/check.sh")).toContain("pnpm exec eslint . --max-warnings 0");
});

it.each([
    ["gate/scripts/check.sh", "#!/usr/bin/env bash\nset -euo pipefail", 0],
    ["gate/scripts/check.sh", "#!/usr/bin/env bash\n# The gate\nset -euo pipefail", 2],
    ["gate/scripts/check.sh", "set -euo pipefail\n# shellcheck disable=SC2086\necho $a", 0],
    ["gate/scripts/check.sh", "# shellcheck source=gate/scripts/criteria.sh\nsource x", 0],
    ["gate/scripts/check.sh", "# shellcheck disable=SC2086 because\necho $a", 1],
    ["gate/scripts/check.sh", "echo up # start it", 1],
    ["gate/scripts/check.sh", "echo \"# not a comment\" '# nor this' ${#list[@]} $#", 0],
    [".githooks/pre-commit", "#!/usr/bin/env bash\n# Before a commit\nset -e", 2],
    [".github/workflows/ci.yml", "jobs:\n  gate:\n    runs-on: ubuntu-24.04 # pinned", 3],
    [".github/workflows/ci.yml", "name: ci\n# the gate\non: push", 2],
    ["pnpm-workspace.yaml", "allowBuilds:\n  esbuild: true # its binary", 2],
    [".github/workflows/ci.yml", "run: echo \"a # b\"\nname: 'c # d'", 0],
    [".gitignore", "dist/\n# generated\nnode_modules/", 2],
    [".gitattributes", "*.png binary\n# Line endings\n* text=auto", 2],
    [".prettierignore", "dist\n# the screenshots\nvisual/snapshots", 2],
    [".editorconfig", "[*]\n# AC-" + "theme-1\nindent_size = 4", 2],
    [".editorconfig", "[*]\n# Reason: two spaces in YAML\nindent_size = 2", 2],
    [".editorconfig", "[*]\n; old style\nroot = true", 2],
    ["justfile", "# Format the code\n[group('maintenance')]\nfmt:\n    prettier --write .", 0],
    ["justfile", "# The whole gate\ncheck *args:\n    @./gate/scripts/check.sh", 0],
    ["justfile", "# The local stack\nmod tmux-dev", 0],
    ["justfile", "# Entry point for humans\n# Format the code\nfmt:\n    x", 1],
    ["justfile", '# Entry point for humans\n\nset shell := ["bash"]', 1],
    ["justfile", "# hidden\n[private]\ndefault:\n    @just --list", 1],
    ["justfile", "fmt:\n    # format it\n    x", 2],
] as const)("the rules find a comment in the hash comment file %s (%#)", (file, text, line) => {
    expect(hashCommentsIn(file, text)[0]?.line ?? 0).toBe(line);
});

it.each([
    [":root { --radius: 0.5rem; }", 0],
    ["/* the palette */\n:root { --radius: 0.5rem; }", 1],
    [":root {\n  --radius: 0.5rem; /* rounder */\n}", 2],
    ['a { background: url(https://example.com/x.png); content: "/* no */"; }', 0],
])("the rules find a comment in CSS (%#)", (text, line) => {
    expect(cssCommentsIn(text)[0]?.line ?? 0).toBe(line);
});

it.each([
    ["knip.json", '{ "a": 1 }', 0],
    ["knip.json", '{\n  // only points at the projects\n  "a": 1\n}', 2],
    ["knip.json", '{ "a": 1 /* a block */ }', 1],
    ["knip.json", '{ "$schema": "https://example.com/x.json", "b": "/* no */" }', 0],
    ["knip.json", '{ "a": "say \\"// no\\"" }', 0],
    ["tsconfig.json", "{\n  // AC-" + 'theme-1\n  "strict": true\n}', 0],
    ["tsconfig.json", "{\n  // AC-" + 'theme-1 keeps it strict\n  "strict": true\n}', 2],
    [".vscode/settings.json", "{\n  // AC-" + 'theme-1\n  "a": 1\n}', 2],
] as const)("the rules find a comment in JSON %s (%#)", (file, text, line) => {
    expect(jsonCommentsIn(file, text)[0]?.line ?? 0).toBe(line);
});

it.each([
    ["<html><body></body></html>", 0],
    ["<html>\n<!-- the page -->\n</html>", 2],
    ['<svg xmlns="http://www.w3.org/2000/svg">\n  <!-- the logo -->\n</svg>', 2],
    ['<?xml version="1.0"?>\n<!--\n  only nuget.org\n-->\n<configuration />', 2],
])("the rules find a comment in HTML, SVG or XML (%#)", (text, line) => {
    expect(htmlCommentsIn(text)[0]?.line ?? 0).toBe(line);
});
