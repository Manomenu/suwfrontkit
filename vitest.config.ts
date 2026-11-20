import path from "node:path";

import { storyTests, unitTests } from "@maniumek/suwgate/vitest";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        projects: [
            unitTests({ extends: "./vite.config.ts", environment: "jsdom", globals: true }),
            storyTests({
                extends: "./vite.config.ts",
                plugin: storybookTest({ configDir: path.join(import.meta.dirname, ".storybook") }),
                provider: playwright(),
            }),
            { test: { name: "gate", environment: "node", include: ["gate/guards/*.test.ts"] } },
        ],
    },
});
