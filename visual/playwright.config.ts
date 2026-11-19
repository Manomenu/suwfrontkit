import path from "node:path";

import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: ".",
    testMatch: "*.visual.ts",
    outputDir: "results",
    snapshotPathTemplate: "{testDir}/snapshots/{projectName}/{arg}{ext}",
    reporter: "line",
    fullyParallel: true,
    expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.001 } },
    use: { baseURL: "http://127.0.0.1:6007" },
    projects: [
        { name: "1920x1080", use: { viewport: { width: 1920, height: 1080 } } },
        { name: "3440x1440", use: { viewport: { width: 3440, height: 1440 } } },
    ],
    webServer: {
        command: "node_modules/.bin/vite preview --outDir storybook-static --host 127.0.0.1 --port 6007 --strictPort",
        url: "http://127.0.0.1:6007/iframe.html",
        cwd: path.resolve(import.meta.dirname, ".."),
        reuseExistingServer: false,
    },
});
