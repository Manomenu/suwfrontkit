import { strict } from "@maniumek/suwgate/eslint";
import { defineConfig } from "eslint/config";
import boundaries from "eslint-plugin-boundaries";
import reactHooks from "eslint-plugin-react-hooks";

const PANEL_PREFERENCE = "src/appShell/panelPreference.ts";
const BROWSER_STORAGE = ["localStorage", "sessionStorage", "indexedDB"];
const BROWSER_STORAGE_FIX = `A component keeps its state in React or takes it from the app as a prop; browser storage lives only in ${PANEL_PREFERENCE}, for the remembered navigation panel.`;

export default defineConfig(
    strict({
        root: import.meta.dirname,
        projects: ["./tsconfig.json", "./tsconfig.node.json"],
        ignores: ["storybook-static", "visual/results"],
        untyped: ["prettier.config.js", "gate/consumer/app/**"],
    }),
    reactHooks.configs.flat["recommended-latest"],
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
                            from: { element: { type: "component", captured: { name: "history" } } },
                            allow: { to: { element: { type: "component", captured: { name: "paginated" } } } },
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
                            from: { element: { type: "component", captured: { name: "paginated" } } },
                            allow: { to: { element: { type: "component", captured: { name: "previousNext" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "previousNext" } } },
                            allow: { to: { element: { type: "component", captured: { name: "button" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceList" } } },
                            allow: { to: { element: { type: "component", captured: { name: "alert" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceList" } } },
                            allow: { to: { element: { type: "component", captured: { name: "button" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceList" } } },
                            allow: { to: { element: { type: "component", captured: { name: "page" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceList" } } },
                            allow: { to: { element: { type: "component", captured: { name: "paginated" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceList" } } },
                            allow: { to: { element: { type: "component", captured: { name: "paper" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceList" } } },
                            allow: { to: { element: { type: "component", captured: { name: "table" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceEdit" } } },
                            allow: { to: { element: { type: "component", captured: { name: "alert" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceEdit" } } },
                            allow: { to: { element: { type: "component", captured: { name: "anchor" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceEdit" } } },
                            allow: { to: { element: { type: "component", captured: { name: "button" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceEdit" } } },
                            allow: { to: { element: { type: "component", captured: { name: "dialog" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceEdit" } } },
                            allow: { to: { element: { type: "component", captured: { name: "page" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceEdit" } } },
                            allow: { to: { element: { type: "component", captured: { name: "paper" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceEdit" } } },
                            allow: { to: { element: { type: "component", captured: { name: "stickyActions" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "query" } } },
                            allow: { to: { element: { type: "component", captured: { name: "apiClient" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "toggleChip" } } },
                            allow: { to: { element: { type: "component", captured: { name: "tooltip" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "anchor" } } },
                            allow: { to: { element: { type: "component", captured: { name: "leaveGuard" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "paginated" } } },
                            allow: { to: { element: { type: "component", captured: { name: "spinner" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceList" } } },
                            allow: { to: { element: { type: "component", captured: { name: "leaveGuard" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceList" } } },
                            allow: { to: { element: { type: "component", captured: { name: "spinner" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceEdit" } } },
                            allow: { to: { element: { type: "component", captured: { name: "spinner" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceEdit" } } },
                            allow: { to: { element: { type: "component", captured: { name: "mistakeList" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "resourceEdit" } } },
                            allow: { to: { element: { type: "component", captured: { name: "apiClient" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "mistakeList" } } },
                            allow: { to: { element: { type: "component", captured: { name: "apiClient" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "multiSelect" } } },
                            allow: { to: { element: { type: "component", captured: { name: "button" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "multiSelect" } } },
                            allow: { to: { element: { type: "component", captured: { name: "input" } } } },
                        },
                        {
                            from: { element: { type: "component", captured: { name: "multiSelect" } } },
                            allow: { to: { element: { type: "component", captured: { name: "badge" } } } },
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
);
