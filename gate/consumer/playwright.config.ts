import path from "node:path";

import { defineConfig } from "@playwright/test";

const app = process.env["CONSUMER_APP"] ?? path.resolve(import.meta.dirname, "app");

export default defineConfig({
    testDir: ".",
    testMatch: "consumer.spec.ts",
    outputDir: `${app}/test-results`,
    reporter: "line",
    use: { baseURL: "http://127.0.0.1:4317" },
    webServer: {
        command: `pnpm --dir ${app} exec vite preview --host 127.0.0.1 --port 4317 --strictPort`,
        url: "http://127.0.0.1:4317",
        reuseExistingServer: false,
    },
});
