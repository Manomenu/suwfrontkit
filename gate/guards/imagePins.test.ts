import { expect, it } from "vitest";

import { paths, read } from "./repository.ts";

const IMAGE = /(?:^|\s)(?:IMAGE=|image:\s*)["']?([\w.\-/:@]+)/gm;
const PLAYWRIGHT_IMAGE = /mcr\.microsoft\.com\/playwright:v([\d.]+)-/;

function images(): { file: string; image: string }[] {
    return paths()
        .filter((file) => /\.(sh|ya?ml)$/.test(file) && file !== "pnpm-lock.yaml")
        .flatMap((file) => [...read(file).matchAll(IMAGE)].map((match) => ({ file, image: match[1] ?? "" })));
}

it("every container image is pinned to a version, never latest", () => {
    const found = images();

    expect(found.length, "the visual tests run in a pinned image: visual.sh must name it as IMAGE=").toBeGreaterThan(0);
    expect(
        found.filter(({ image }) => !image.includes(":") || image.endsWith(":latest")).map(({ file, image }) => `${file}: ${image}`),
        "pin it to a version (name:1.2.3), a moving tag makes screenshots and builds irreproducible",
    ).toEqual([]);
});

it("the Playwright image is the version of the installed Playwright", () => {
    const installed = (JSON.parse(read("package.json")) as { devDependencies: Record<string, string> }).devDependencies["@playwright/test"];
    const pinned = images()
        .map(({ file, image }) => ({ file, version: PLAYWRIGHT_IMAGE.exec(image)?.[1] }))
        .filter((item) => item.version !== undefined);

    expect(pinned.length).toBeGreaterThan(0);
    expect(
        pinned.filter(({ version }) => version !== installed).map(({ file, version }) => `${file}: v${String(version)}`),
        `move the image to mcr.microsoft.com/playwright:v${String(installed)}-noble with @playwright/test: the image's browsers must be the ones the tests expect`,
    ).toEqual([]);
});
