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

# Which guardrails keep each acceptance criterion of the specs true: id, kind, file:line (or one: just criteria AC-<feature>-<n>)
[group('run')]
[positional-arguments]
criteria *args:
    @./gate/scripts/criteria.sh "$@"

# Move the pinned vdoc.py of the acceptance criteria check to the suwagent plugin's newest master
[group('run')]
criteria-update:
    @./gate/scripts/criteria.sh --update

# The package as an app installs it: pnpm pack, publint, attw, a consumer app in Chromium (screenshots with --shots <folder>)
[group('maintenance')]
[positional-arguments]
package *args:
    @./gate/scripts/package.sh "$@"

# Visual regression, axe and the font test of every story, in the pinned Playwright image
[group('maintenance')]
visual:
    @./gate/scripts/visual.sh

# Record the screenshots again after a deliberate change of the look; read the diff of every changed image
[group('maintenance')]
visual-update:
    @./gate/scripts/visual.sh --update

# The whole gate, the same CI runs
[group('maintenance')]
check:
    @./gate/scripts/check.sh

# The quick gate: guards, palette, and tsc, eslint, shellcheck for what changed (what the Claude Code Stop hook runs)
[group('maintenance')]
check-quick:
    @./gate/scripts/check.sh --quick

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
