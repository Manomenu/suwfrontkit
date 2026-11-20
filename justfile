set shell := ["bash", "-euo", "pipefail", "-c"]

[private]
default:
    @just --list --unsorted

# Storybook on http://localhost:6006: every component in every state, with the a11y and Vitest panels
[group('dev')]
storybook:
    pnpm storybook

# Build dist/ as it is published (tsc: ESM and .d.ts per file, theme CSS copied)
[group('dev')]
build:
    pnpm run build

# Regenerate src/theme/palette.css from @catppuccin/palette (never edit it by hand)
[group('dev')]
palette:
    node scripts/.internal/palette.ts

# Describe a change for the next release (a changeset); every change of src/ needs one
[group('dev')]
changeset:
    pnpm changeset

# Record the screenshots again after a deliberate change of the look; read the diff of every changed image
[group('maintenance')]
visual-update:
    @./scripts/.internal/visual-update.sh

# The whole gate, the same CI runs (suwgate check: the steps of the library profile, the guards, suwgate.yml)
[group('maintenance')]
check:
    pnpm exec suwgate check

# The quick gate: the guards, palette and the library's guards, and tsc, eslint, shellcheck for what changed (what the Stop hook runs)
[group('maintenance')]
check-quick:
    pnpm exec suwgate check --quick

# Format the code with Prettier
[group('maintenance')]
fmt:
    pnpm exec prettier --write --log-level warn .

# Install packages from the lockfile and the Chromium of Playwright, and enable the git hooks
[group('maintenance')]
sync:
    git config core.hooksPath .githooks
    pnpm install --frozen-lockfile
    pnpm exec playwright install chromium
