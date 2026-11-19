import { spawnSync } from "node:child_process";

import { expect, it } from "vitest";

import { fileName, paths, read, ROOT } from "./repository.ts";

const NOT_FOR_CALLING = new Set(["hook-guard-edit.sh", "hook-stop.sh"]);

const scripts = paths().filter((file) => file.endsWith(".sh") && !NOT_FOR_CALLING.has(fileName(file)));

it.each(scripts)("%s answers --help", (script) => {
    const text = read(script);
    expect(
        text.includes("--help") || text.includes("usage:"),
        `${script} would run for real on --help: AGENTS.md sends agents to --help instead of describing the commands; print a usage() text on --help as check.sh does`,
    ).toBe(true);

    const run = spawnSync("bash", [script, "--help"], { cwd: ROOT, encoding: "utf8", timeout: 30_000 });

    expect(
        run.stdout.length + run.stderr.length,
        `${script} --help printed nothing: print what it does and how to call it`,
    ).toBeGreaterThan(0);
});
