import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, type Page } from "@playwright/test";
import { SET_CURRENT_STORY, STORY_FINISHED, STORY_MISSING, type StoryFinishedPayload } from "storybook/internal/core-events";

interface IndexEntry {
    id: string;
    type: string;
}

interface PreviewChannel {
    on: (event: string, listener: (payload: unknown) => void) => void;
    emit: (event: string, payload: unknown) => void;
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
    await page.goto("/iframe.html?viewMode=story");
    await page.waitForFunction(() => "__STORYBOOK_ADDONS_CHANNEL__" in globalThis);
    const status = await page.evaluate(
        ({ storyId, events }) =>
            new Promise<string>((resolve) => {
                const channel = (globalThis as unknown as { __STORYBOOK_ADDONS_CHANNEL__: PreviewChannel }).__STORYBOOK_ADDONS_CHANNEL__;
                channel.on(events.finished, (payload) => {
                    const finished = payload as StoryFinishedPayload;
                    if (finished.storyId === storyId) resolve(finished.status);
                });
                channel.on(events.missing, (payload) => {
                    if (payload === storyId) resolve("missing");
                });
                channel.emit(events.setCurrentStory, { storyId, viewMode: "story" });
            }),
        { storyId: id, events: { finished: STORY_FINISHED, missing: STORY_MISSING, setCurrentStory: SET_CURRENT_STORY } },
    );
    expect(status, `story ${id} did not render and play cleanly: run its story test (suwgate step stories)`).toBe("success");
    await expect(page.locator("#storybook-root > *").first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
}
