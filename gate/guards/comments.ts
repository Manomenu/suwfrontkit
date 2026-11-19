export interface FoundComment {
    line: number;
    text: string;
}

export const CRITERION_ID = "AC-[a-z0-9]+(?:-[a-z0-9]+)*-[0-9]+";

export const FIX =
    'delete the comment; rename or split the code so it explains itself; put lasting knowledge in a test, a story, the README or AGENTS.md (the only comments allowed are the tool directives listed in AGENTS.md, "No comments")';

const GENERATED = new Set(["pnpm-lock.yaml"]);
const SKIPPED_FOLDERS = ["node_modules/", "dist/", ".artifacts/", "docs/", "storybook-static/", "visual/snapshots/", ".changeset/"];

export function isScanned(file: string): boolean {
    return !GENERATED.has(file) && !SKIPPED_FOLDERS.some((folder) => file.startsWith(folder) || file.includes(`/${folder}`));
}

function endOfString(text: string, opening: number, quote: string): number {
    for (let at = opening + 1; at < text.length; at++) {
        if (text[at] === "\\") at++;
        else if (text[at] === quote) return at + 1;
    }
    return text.length;
}

function lineBreaks(text: string, start: number, end: number): number {
    return text.slice(start, end).split("\n").length - 1;
}

export function scan(text: string, lineComment: string | null, quotes: string, blockStart = "/*", blockEnd = "*/"): FoundComment[] {
    const found: FoundComment[] = [];
    let line = 1;
    let at = 0;
    while (at < text.length) {
        const sign = text.charAt(at);
        if (sign === "\n") {
            line++;
            at++;
        } else if (quotes.includes(sign)) {
            const end = endOfString(text, at, sign);
            line += lineBreaks(text, at, end);
            at = end;
        } else if (lineComment !== null && text.startsWith(lineComment, at)) {
            const newline = text.indexOf("\n", at);
            const end = newline < 0 ? text.length : newline;
            found.push({ line, text: text.slice(at, end).trim() });
            at = end;
        } else if (text.startsWith(blockStart, at)) {
            const close = text.indexOf(blockEnd, at + blockStart.length);
            const end = close < 0 ? text.length : close + blockEnd.length;
            found.push({ line, text: text.slice(at, end).trim() });
            line += lineBreaks(text, at, end);
            at = end;
        } else {
            at++;
        }
    }
    return found;
}

export function shown(comment: FoundComment): string {
    const first = (comment.text.split("\n")[0] ?? "").trim();
    return first.length > 120 ? `${first.slice(0, 120)}…` : first;
}
