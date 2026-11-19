import { spawnSync } from "node:child_process";
import path from "node:path";

import { expect, it } from "vitest";

import { ROOT } from "./repository.ts";

function run(file: string, allowGateEdit = false): { status: number | null; errors: string } {
    const env = { ...process.env };
    delete env["ALLOW_GATE_EDIT"];
    if (allowGateEdit) env["ALLOW_GATE_EDIT"] = "1";
    const result = spawnSync("bash", ["gate/scripts/hook-guard-edit.sh"], {
        cwd: ROOT,
        env,
        encoding: "utf8",
        input: JSON.stringify({ tool_name: "Edit", tool_input: { file_path: path.join(ROOT, file) } }),
    });
    return { status: result.status, errors: result.stderr };
}

it.each([
    "gate/scripts/check.sh",
    "gate/scripts/criteria.sh",
    "gate/scripts/hook-guard-edit.sh",
    "gate/criteria.json",
    "gate/guards/comments.test.ts",
    "gate/consumer/consumer.spec.ts",
    ".claude/settings.json",
    ".github/workflows/ci.yml",
    ".editorconfig",
    "eslint.config.js",
    "eslint.config.test.js",
    "tsconfig.json",
    "tsconfig.build.json",
    "vitest.config.ts",
    "visual/playwright.config.ts",
    "visual/stories.visual.ts",
    "knip.json",
    ".changeset/config.json",
])("an agent cannot edit %s and is told to ask the owner", (file) => {
    const { status, errors } = run(file);

    expect(status).toBe(2);
    expect(errors).toContain("ALLOW_GATE_EDIT=1 claude");
    expect(errors).toContain("ask the user");
});

it("the owner lets a session edit the gate", () => {
    expect(run("gate/scripts/check.sh", true).status).toBe(0);
});

it.each([
    ["pnpm-lock.yaml", "pnpm install"],
    ["src/theme/palette.css", "just palette"],
    ["visual/snapshots/1920x1080/button--variants.png", "visual.sh --update"],
])("the generated %s is refused with the command that regenerates it", (file, command) => {
    const { status, errors } = run(file);

    expect(status).toBe(2);
    expect(errors).toContain(command);
});

it.each(["src/button/Button.tsx", "src/theme/theme.css", "AGENTS.md", "README.md", "package.json"])("%s stays editable", (file) => {
    expect(run(file).status).toBe(0);
});
