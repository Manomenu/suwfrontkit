#!/usr/bin/env bash
set -euo pipefail
IMAGE="mcr.microsoft.com/playwright:v1.65.1-noble"
usage() {
    cat <<USAGE
usage: visual-update.sh | --help
Records the screenshots in visual/snapshots/ again after a deliberate change of the look: builds Storybook and runs
visual/*.visual.ts with --update-snapshots in the pinned Playwright image ($IMAGE), the image the visual step of
suwgate check compares in. A changed screenshot is a change of the look, so read the diff of every changed image.
USAGE
}
case "${1:-}" in
    "") ;;
    --help)
        usage
        exit 0
        ;;
    *)
        usage >&2
        exit 2
        ;;
esac
cd "$(dirname "$0")/../.."
pnpm run build-storybook >/dev/null
docker run --rm --init --ipc=host --security-opt label=disable -v "$PWD:/work" -w /work "$IMAGE" \
    node_modules/.bin/playwright test -c visual/playwright.config.ts --update-snapshots
