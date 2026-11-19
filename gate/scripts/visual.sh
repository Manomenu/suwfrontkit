#!/usr/bin/env bash
set -euo pipefail
IMAGE="mcr.microsoft.com/playwright:v1.65.1-noble"
usage() {
    cat <<USAGE
usage: visual.sh [--update] | --help
Visual regression, accessibility and font check of every story, in the pinned Playwright image ($IMAGE), so a
screenshot taken on a laptop matches one taken in CI. Builds Storybook (storybook-static/), then runs
visual/*.visual.ts at 1920x1080 and 3440x1440: each story against its recorded screenshot in visual/snapshots/ plus
axe (WCAG 2.1 AA), and the font test (Inter Variable loaded, not only named).
  visual.sh            compare with the recorded screenshots
  visual.sh --update   record them again; a changed screenshot is a change of the look, so its diff is always read
USAGE
}
UPDATE=()
case "${1:-}" in
    "") ;;
    --update) UPDATE=(--update-snapshots) ;;
    --help)
        usage
        exit 0
        ;;
    *)
        usage >&2
        exit 2
        ;;
esac
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
pnpm run build-storybook >/dev/null

docker run --rm --init --ipc=host --security-opt label=disable -v "$ROOT:/work" -w /work -e CI "$IMAGE" \
    node_modules/.bin/playwright test -c visual/playwright.config.ts "${UPDATE[@]}"
