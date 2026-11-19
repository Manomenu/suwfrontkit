import { expect, it } from "vitest";

import { paths, read } from "./repository.ts";

const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\b(rgb|rgba|hsl|hsla|oklch|oklab)\(|\[#/;

it("components use the theme's tokens, never a colour value of their own", () => {
    const found = paths()
        .filter((file) => file.startsWith("src/") && /\.(ts|tsx)$/.test(file))
        .flatMap((file) =>
            read(file)
                .split("\n")
                .map((line, index) => ({ line, index }))
                .filter(({ line }) => RAW_COLOR.test(line))
                .map(({ index }) => `${file}:${index + 1}`),
        );

    expect(
        found,
        "use a token class (bg-primary, text-muted-foreground) or var(--token); a new colour goes into src/theme/theme.css",
    ).toEqual([]);
});
