import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, type Page } from "@playwright/test";

interface IndexEntry {
    id: string;
    type: string;
}

export function storyIds(): string[] {
    const index = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "../storybook-static/index.json"), "utf8")) as {
        entries: Record<string, IndexEntry>;
    };
    return Object.values(index.entries)
        .filter((entry) => entry.type === "story")
        .map((entry) => entry.id);
}

export async function openStory(page: Page, id: string): Promise<void> {
    await page.goto(`/iframe.html?id=${id}&viewMode=story`);
    await expect(page.locator("#storybook-root > *").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
}
