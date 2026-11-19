import { expect, it } from "vitest";

import { read } from "./repository.ts";

const BANNED: Record<string, string> = {
    "@mantine/": "build it from this library's components and Tailwind utilities",
    "@emotion/": "style with Tailwind utilities and the theme's tokens",
    "styled-components": "style with Tailwind utilities and the theme's tokens",
    "@chakra-ui/": "build it from this library's components and Tailwind utilities",
    "@mui/": "build it from this library's components and Tailwind utilities",
    classnames: "use cn() from src/classNames.ts",
    lodash: "use the standard library",
    moment: "use Intl and Date",
    jquery: "use React and the DOM",
};

it("no banned package is a dependency", () => {
    const manifest = JSON.parse(read("package.json")) as Record<string, Record<string, string> | undefined>;
    const names = ["dependencies", "devDependencies", "peerDependencies"].flatMap((group) => Object.keys(manifest[group] ?? {}));

    const found = names.flatMap((name) =>
        Object.entries(BANNED)
            .filter(([banned]) => name === banned || (banned.endsWith("/") && name.startsWith(banned)))
            .map(([, fix]) => `${name}: ${fix}`),
    );

    expect(found, "remove the package and use the alternative").toEqual([]);
});
