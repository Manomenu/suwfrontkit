import { expect, test, type Page } from "@playwright/test";

const shots = process.env["CONSUMER_SHOTS"] ?? "";

const toggleOf = (page: Page) => page.getByRole("button", { name: "Navigation panel" });

async function widthOf(page: Page, selector: string): Promise<number> {
    const box = await page.locator(selector).boundingBox();
    if (box === null) throw new Error(`${selector} is not on the screen`);
    return box.width;
}

async function interLoaded(page: Page): Promise<{ check: boolean; loaded: number; unloaded: number }> {
    return page.evaluate(async () => {
        await document.fonts.ready;
        const faces = await document.fonts.load('16px "Inter Variable"');
        return {
            check: document.fonts.check('16px "Inter Variable"'),
            loaded: faces.filter((face) => face.status === "loaded").length,
            unloaded: faces.filter((face) => face.status !== "loaded").length,
        };
    });
}

for (const [width, height] of [
    [1920, 1080],
    [3440, 1440],
] as const) {
    test(`at ${width}x${height} the installed package draws its styles, loads Inter from the app's origin, and the panel remembers its state`, async ({
        page,
    }) => {
        await page.setViewportSize({ width, height });
        await page.goto("/");
        await page.evaluate(() => {
            window.localStorage.clear();
        });
        await page.reload();

        const button = page.getByRole("button", { name: "Add a company" });
        await expect(button).toHaveCSS("background-color", "rgb(203, 166, 247)");
        await expect(page.locator("body")).toHaveCSS("background-color", "rgb(30, 30, 46)");
        await expect(page.locator("body")).toHaveCSS("font-family", /^"Inter Variable"/);

        const inter = await interLoaded(page);
        expect(inter.check, "document.fonts.check('16px \"Inter Variable\"')").toBe(true);
        expect(inter.loaded, "Inter Variable faces loaded for Latin text").toBeGreaterThan(0);
        const fonts = await page.evaluate(() =>
            performance
                .getEntriesByType("resource")
                .map((entry) => entry.name)
                .filter((name) => name.endsWith(".woff2")),
        );
        expect(fonts.length, "a woff2 file was fetched").toBeGreaterThan(0);
        for (const url of fonts) expect(new URL(url).origin).toBe("http://127.0.0.1:4317");

        await expect(toggleOf(page)).toHaveAttribute("aria-expanded", "true");
        const expandedContent = await widthOf(page, "main");
        expect(expandedContent).toBeGreaterThan(width - 300);
        if (shots !== "") await page.screenshot({ path: `${shots}/appshell-${width}x${height}-expanded.png` });

        await toggleOf(page).click();
        await expect(toggleOf(page)).toHaveAttribute("aria-expanded", "false");
        await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
        expect(await widthOf(page, "#navigation-panel")).toBeLessThanOrEqual(64);
        expect(await widthOf(page, "main")).toBeGreaterThan(expandedContent + 100);

        await page.reload();
        await expect(toggleOf(page)).toHaveAttribute("aria-expanded", "false");
        await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
        if (shots !== "") await page.screenshot({ path: `${shots}/appshell-${width}x${height}-collapsed.png` });
    });
}
