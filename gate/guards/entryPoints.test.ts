import { existsSync } from "node:fs";
import path from "node:path";

import { expect, it } from "vitest";

import { ROOT, read } from "./repository.ts";

const IMPORT = /(?:^|\n)\s*(?:import|export)\b[^"';]*?["']([^"']+)["']/g;

function sourceOf(file: string, specifier: string): string | null {
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier)).replace(/\.js$/, "");
    return (
        [".ts", ".tsx"].map((extension) => `${resolved}${extension}`).find((candidate) => existsSync(path.join(ROOT, candidate))) ?? null
    );
}

function packagesReachedFrom(entry: string): Set<string> {
    const packages = new Set<string>();
    const seen = new Set<string>();
    const waiting = [entry];
    for (let file = waiting.pop(); file !== undefined; file = waiting.pop()) {
        if (seen.has(file)) continue;
        seen.add(file);
        for (const [, specifier = ""] of read(file).matchAll(IMPORT)) {
            if (!specifier.startsWith(".")) packages.add(specifier);
            else {
                const source = sourceOf(file, specifier);
                if (source !== null) waiting.push(source);
            }
        }
    }
    return packages;
}

function optionalPeers(): string[] {
    const manifest = JSON.parse(read("package.json")) as { peerDependenciesMeta?: Record<string, { optional?: boolean }> };
    return Object.entries(manifest.peerDependenciesMeta ?? {})
        .filter(([, meta]) => meta.optional === true)
        .map(([name]) => name);
}

const of = (packages: Set<string>, peers: string[]) =>
    [...packages].filter((name) => peers.some((peer) => name === peer || name.startsWith(`${peer}/`)));

it("the main entry point reaches no optional peer dependency, so an app without the diagram builds without React Flow", () => {
    const peers = optionalPeers();

    expect(peers, "the walk below has nothing to look for: @xyflow/react is an optional peer").toContain("@xyflow/react");
    expect(of(packagesReachedFrom("src/diagram/index.ts"), peers), "the walk follows the imports of the diagram's entry point").toContain(
        "@xyflow/react",
    );
    expect(
        of(packagesReachedFrom("src/index.ts"), peers),
        "src/index.ts must not import, even through another module, a package that is an optional peer: export the component from its own entry point (src/diagram/index.ts, ./diagram in the exports of package.json)",
    ).toEqual([]);
});
