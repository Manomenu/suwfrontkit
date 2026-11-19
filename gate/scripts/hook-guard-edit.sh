#!/usr/bin/env bash
set -euo pipefail

input="$(cat)"
path="$(printf '%s' "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -n 1 | sed 's/^[^:]*:[[:space:]]*"//; s/"$//')"
path="$(printf '%s' "$path" | tr '\134' '/')"
[ -n "$path" ] || exit 0

project="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
project="$(printf '%s' "$project" | tr '\134' '/')"
case "$path" in
    "$project"/*) ;;
    *) exit 0 ;;
esac

if [ "${ALLOW_GATE_EDIT:-}" != "1" ]; then
    case "$path" in
        */gate/* | */.claude/settings.json | */.github/workflows/* | */.editorconfig | */eslint.config.js | */eslint.config.test.js | \
            */tsconfig*.json | */vitest.config.ts | */visual/playwright.config.ts | */visual/*.visual.ts | */visual/storybook.ts | \
            */knip.json | */.changeset/config.json | */.storybook/*)
            echo "Blocked: $path is part of the gate (a check, a hook or a lint config), which an agent does not change on its own." >&2
            echo "Do not work around it: ask the user to start a session with ALLOW_GATE_EDIT=1 claude and give them the exact change to make there (the file, what to change, why)." >&2
            exit 2
            ;;
    esac
fi

case "$path" in
    */pnpm-lock.yaml)
        echo "Blocked: $path is a generated lockfile. Change package.json and run: pnpm install" >&2
        exit 2
        ;;
    */src/theme/palette.css)
        echo "Blocked: $path is generated from @catppuccin/palette. Regenerate it with just palette (scripts/.internal/palette.ts) instead of editing it." >&2
        exit 2
        ;;
    */visual/snapshots/*)
        echo "Blocked: $path is a recorded screenshot. Record it again with gate/scripts/visual.sh --update (just visual-update), and say in the change why the look changed." >&2
        exit 2
        ;;
esac
exit 0
