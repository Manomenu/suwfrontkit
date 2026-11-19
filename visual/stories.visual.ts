import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { openStory, storyIds } from "./storybook.ts";

for (const id of storyIds()) {
    test(`${id} looks as recorded and has no accessibility violations`, async ({ page }) => {
        await openStory(page, id);

        await expect(page).toHaveScreenshot(`${id}.png`);
        const axe = await new AxeBuilder({ page })
            .include("#storybook-root")
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze();
        expect(axe.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
    });
}
