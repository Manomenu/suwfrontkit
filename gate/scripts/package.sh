#!/usr/bin/env bash
set -euo pipefail
usage() {
    cat <<'USAGE'
usage: package.sh [--shots <folder>] | --help
Checks the package as an app gets it from npm: packs it with pnpm pack (which builds dist/ with tsc), lints the tarball
with publint --strict and attw --profile esm-only, then installs the tarball into a copy of gate/consumer/app (Vite,
Tailwind at the lowest version the package allows, no @source line of its own) in a temporary folder, builds it and checks:
  - the built CSS holds the utilities of the package's components and the theme's variables (theme.css finds the
    components by itself), and the build holds the Inter Variable woff2 files;
  - in Chromium at 1920x1080 and 3440x1440 (gate/consumer/consumer.spec.ts): the components are styled, Inter Variable
    is loaded (document.fonts.check and loaded font faces) from the app's own origin under a font-src 'self' policy, and
    the AppShell panel collapses and stays collapsed after a reload, and the diagram of @maniumek/suwfrontkit/diagram
    draws its nodes in the theme's colours and selects one on click;
  - a copy of gate/consumer/plain (no @xyflow/react) builds with the main entry point alone, and its bundle holds no React
    Flow: the diagram stays an optional entry point.
The consumer app is served on a free port of 127.0.0.1, so two checkouts (agents in worktrees) can run it at once.
--shots <folder> also saves screenshots of the AppShell there. Needs the Playwright Chromium: pnpm exec playwright install chromium.
USAGE
}
SHOTS=""
case "${1:-}" in
    "") ;;
    --help)
        usage
        exit 0
        ;;
    --shots)
        SHOTS="$(realpath "${2:?--shots needs a folder}")"
        ;;
    *)
        usage >&2
        exit 2
        ;;
esac
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cd "$ROOT"
pnpm pack --pack-destination "$WORK" >/dev/null
TARBALL="$(ls "$WORK"/*.tgz)"
pnpm exec publint "$TARBALL" --strict
pnpm exec attw "$TARBALL" --profile esm-only --exclude-entrypoints ./theme.css ./diagram.css --format table-flipped

fail() {
    echo "package.sh: $1" >&2
    exit 1
}

cp -r "$ROOT/gate/consumer/plain" "$WORK/plain"
cd "$WORK/plain"
pnpm add "$TARBALL" --silent
[ ! -e node_modules/@xyflow/react ] || fail "installing the package brought @xyflow/react into an app without the diagram: keep it an optional peer (peerDependenciesMeta) in package.json"
pnpm exec vite build --logLevel warn
if grep -rqi "react-flow" dist/assets; then
    fail "an app that imports only the main entry point bundles React Flow: src/index.ts reaches the diagram; export it only from src/diagram/index.ts"
fi

cp -r "$ROOT/gate/consumer/app" "$WORK/app"
cd "$WORK/app"
pnpm add "$TARBALL" --silent
pnpm exec vite build --logLevel warn
CSS="$(cat dist/assets/*.css)"
for needle in ".bg-primary" ".text-primary-foreground" "--ctp-mauve" "Inter Variable"; do
    case "$CSS" in
        *"$needle"*) ;;
        *) fail "the consumer's built CSS lacks $needle: theme.css no longer brings the components' utilities or the theme (its @source line, its imports)" ;;
    esac
done
compgen -G "dist/assets/inter-latin-wght-normal*.woff2" >/dev/null || fail "the consumer's build has no Inter Variable woff2: theme.css must import @fontsource-variable/inter/wght.css"

free_port() { node -e 'const server = require("node:net").createServer().listen(0, "127.0.0.1", () => { console.log(server.address().port); server.close(); });'; }

cd "$ROOT"
CONSUMER_APP="$WORK/app" CONSUMER_SHOTS="$SHOTS" CONSUMER_PORT="$(free_port)" pnpm exec playwright test -c gate/consumer/playwright.config.ts
