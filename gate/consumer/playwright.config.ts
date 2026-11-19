import path from "node:path";

import { defineConfig } from "@playwright/test";

const app = process.env["CONSUMER_APP"] ?? path.resolve(import.meta.dirname, "app");
const port = process.env["CONSUMER_PORT"] ?? "4317";

export default defineConfig({
    testDir: ".",
    testMatch: "consumer.spec.ts",
    outputDir: `${app}/test-results`,
    reporter: "line",
    use: { baseURL: `http://127.0.0.1:${port}` },
    webServer: {
        command: `pnpm --dir ${app} exec vite preview --host 127.0.0.1 --port ${port} --strictPort`,
        url: `http://127.0.0.1:${port}`,
        reuseExistingServer: false,
    },
});
