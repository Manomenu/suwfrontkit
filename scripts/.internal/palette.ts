import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { flavors } from "@catppuccin/palette";

const USAGE = `usage: palette.ts [--check] | --help
Writes src/theme/palette.css: one --ctp-<name> custom property per colour of Catppuccin Mocha, from @catppuccin/palette.
  palette.ts           regenerate the file (just palette)
  palette.ts --check   exit 1 when the file differs from what the installed @catppuccin/palette gives (the gate)`;

const target = path.resolve(import.meta.dirname, "../../src/theme/palette.css");

function generated(): string {
    const lines = flavors.mocha.colorEntries.map(([name, color]) => `    --ctp-${name}: ${color.hex};`);
    return `:root {\n${lines.join("\n")}\n}\n`;
}

const argument = process.argv[2];
if (argument === "--help") {
    console.log(USAGE);
} else if (argument === "--check") {
    if (readFileSync(target, "utf8") !== generated()) {
        console.error(`${target} differs from @catppuccin/palette: run just palette (never edit the file by hand)`);
        process.exit(1);
    }
} else if (argument === undefined) {
    writeFileSync(target, generated());
} else {
    console.error(USAGE);
    process.exit(2);
}
