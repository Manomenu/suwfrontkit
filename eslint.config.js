import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import boundaries from "eslint-plugin-boundaries";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const TOOL_DIRECTIVES = [/^ @ts-expect-error \S/, /^ @vitest-environment [\w-]+$/];
const CRITERION_MARKER = /^ AC-[a-z0-9]+(-[a-z0-9]+)*-[0-9]+$/;
const PANEL_PREFERENCE = "src/appShell/panelPreference.ts";
const BROWSER_STORAGE = ["localStorage", "sessionStorage", "indexedDB"];
const BROWSER_STORAGE_FIX = `A component keeps its state in React or takes it from the app as a prop; browser storage lives only in ${PANEL_PREFERENCE}, for the remembered navigation panel.`;

export const noComments = {
    meta: {
        type: "problem",
        schema: [],
        messages: {
            comment:
                'Delete the comment; rename or split the code so it explains itself; put lasting knowledge in a test, a story, the README or AGENTS.md (the only comments allowed are the tool directives listed in AGENTS.md, "No comments").',
        },
    },
    create(context) {
        const readsCriterionMarkers = context.filename.endsWith("eslint.config.js");
        return {
            Program() {
                for (const comment of context.sourceCode.getAllComments()) {
                    const allowed =
                        comment.type === "Shebang" ||
                        TOOL_DIRECTIVES.some((directive) => directive.test(comment.value)) ||
                        (readsCriterionMarkers && CRITERION_MARKER.test(comment.value));
                    if (!allowed) {
                        context.report({ loc: comment.loc, messageId: "comment" });
                    }
                }
            },
        };
    },
};

export default defineConfig(
    { ignores: ["dist", "storybook-static", "visual/results", "!.storybook"] },
    js.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    reactHooks.configs.flat["recommended-latest"],
    {
        languageOptions: {
            parserOptions: { project: ["./tsconfig.json", "./tsconfig.node.json"], tsconfigRootDir: import.meta.dirname },
        },
        rules: {
            "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
            "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
            "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
        },
    },
    {
        files: ["src/**/*.{ts,tsx}"],
        ignores: ["src/**/*.stories.tsx", "src/**/*.test.{ts,tsx}"],
        plugins: { boundaries },
        settings: {
            "import/resolver": { typescript: { project: "./tsconfig.json" }, node: { extensions: [".ts", ".tsx"] } },
            "boundaries/elements": [
                { type: "theme", pattern: "src/theme" },
                { type: "component", pattern: "src/*", capture: ["name"] },
            ],
            "boundaries/files": [
                { category: "entry", pattern: "src/index.ts" },
                { category: "base", pattern: "src/classNames.ts" },
            ],
        },
        rules: {
            "boundaries/dependencies": [
                "error",
                {
                    default: "disallow",
                    policies: [
                        { allow: { to: { module: { origin: "external" } } } },
                        { allow: { dependency: { relationship: { to: "internal" } } } },
                        {
                            from: { file: { categories: "entry" } },
                            allow: { to: [{ file: { categories: "base" } }, { element: { type: "component" } }] },
                        },
                        { from: { element: { type: "component" } }, allow: { to: { file: { categories: "base" } } } },
                        {
                            from: { element: { type: "component", captured: { name: "field" } } },
                            allow: { to: { element: { type: "component", captured: { name: "label" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "field" } } },
                            allow: { to: { element: { type: "component", captured: { name: "infoTip" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "paginated" } } },
                            allow: { to: { element: { type: "component", captured: { name: "alert" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "dialog" } } },
                            allow: { to: { element: { type: "component", captured: { name: "button" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "dialog" } } },
                            allow: { to: { element: { type: "component", captured: { name: "paper" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "errorBoundary" } } },
                            allow: { to: { element: { type: "component", captured: { name: "alert" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "errorBoundary" } } },
                            allow: { to: { element: { type: "component", captured: { name: "button" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "statusBadge" } } },
                            allow: { to: { element: { type: "component", captured: { name: "badge" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "paginated" } } },
                            allow: { to: { element: { type: "component", captured: { name: "button" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceList" } } },
                            allow: {
                                to: [
                                    { element: { type: "component", captured: { name: "alert" } } },
                                    { element: { type: "component", captured: { name: "button" } } },
                                    { element: { type: "component", captured: { name: "page" } } },
                                    { element: { type: "component", captured: { name: "paginated" } } },
                                    { element: { type: "component", captured: { name: "paper" } } },
                                    { element: { type: "component", captured: { name: "table" } } },
                                ],
                            },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceEdit" } } },
                            allow: {
                                to: [
                                    { element: { type: "component", captured: { name: "alert" } } },
                                    { element: { type: "component", captured: { name: "anchor" } } },
                                    { element: { type: "component", captured: { name: "button" } } },
                                    { element: { type: "component", captured: { name: "page" } } },
                                    { element: { type: "component", captured: { name: "paper" } } },
                                    { element: { type: "component", captured: { name: "stickyActions" } } },
                                ],
                            },
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["src/**/*.{ts,tsx}"],
        ignores: [PANEL_PREFERENCE, "src/appShell/AppShell.test.tsx", "src/appShell/AppShell.stories.tsx"],
        rules: {
            "no-restricted-globals": ["error", ...BROWSER_STORAGE.map((name) => ({ name, message: BROWSER_STORAGE_FIX }))],
            "no-restricted-properties": [
                "error",
                ...BROWSER_STORAGE.map((property) => ({ object: "window", property, message: BROWSER_STORAGE_FIX })),
            ],
        },
    },
    {
        files: ["**/*.{ts,tsx,js,mjs,cjs}"],
        plugins: { local: { rules: { "no-comments": noComments } } },
        rules: { "local/no-comments": "error" },
    },
    {
        files: ["eslint.config.js", "eslint.config.test.js", "gate/consumer/app/**"],
        extends: [tseslint.configs.disableTypeChecked],
    },
);
