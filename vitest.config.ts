import path from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        projects: [
            {
                extends: "./vite.config.ts",
                test: { name: "unit", environment: "jsdom", globals: true, include: ["src/**/*.test.{ts,tsx}"] },
            },
            {
                extends: "./vite.config.ts",
                plugins: [storybookTest({ configDir: path.join(import.meta.dirname, ".storybook") })],
                test: {
                    name: "stories",
                    browser: { enabled: true, provider: playwright(), headless: true, instances: [{ browser: "chromium" }] },
                },
            },
            {
                test: { name: "gate", environment: "node", include: ["gate/guards/**/*.test.ts", "eslint.config.test.js"] },
            },
        ],
    },
});
