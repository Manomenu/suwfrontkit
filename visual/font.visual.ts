import { expect, test } from "@playwright/test";

import { openStory } from "./storybook.ts";

test("Inter Variable is loaded, not only named: document.fonts.check passes and its faces are loaded", async ({ page }) => {
    await openStory(page, "theme-tokens--typography");

    const inter = await page.evaluate(async () => {
        const faces = await document.fonts.load('16px "Inter Variable"');
        return {
            check: document.fonts.check('16px "Inter Variable"'),
            loaded: faces.filter((face) => face.status === "loaded").length,
            family: getComputedStyle(document.body).fontFamily,
        };
    });

    expect(inter.family).toMatch(/^"Inter Variable"/);
    expect(inter.check, "document.fonts.check('16px \"Inter Variable\"') after load").toBe(true);
    expect(inter.loaded, 'faces of "Inter Variable" with status "loaded"').toBeGreaterThan(0);
});
