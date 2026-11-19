import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(import.meta.dirname, "../..");

export function paths(): string[] {
    return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" })
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0 && existsSync(path.join(ROOT, line)));
}

export function read(file: string): string {
    return readFileSync(path.join(ROOT, file), "utf8");
}

export function fileName(file: string): string {
    return path.posix.basename(file);
}
