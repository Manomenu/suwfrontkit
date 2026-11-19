import { expect, it } from "vitest";

import { isScanned } from "./comments.ts";
import { paths, read } from "./repository.ts";

const PRAGMA = /@ts-(ignore|nocheck)\b|eslint-disable/;

it("no source file switches the type checker or a lint rule off in place", () => {
    const offenders = paths()
        .filter((file) => isScanned(file) && /\.(ts|tsx|js)$/.test(file) && file !== "eslint.config.js" && file !== "eslint.config.test.js")
        .filter((file) => !file.startsWith("gate/guards/"))
        .filter((file) => PRAGMA.test(read(file)))
        .sort();

    expect(
        offenders,
        "fix the type or the code; a rule that does not fit this repository is switched off once in eslint.config.js, for every file, by the owner",
    ).toEqual([]);
});
