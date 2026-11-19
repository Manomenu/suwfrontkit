#!/usr/bin/env bash
set -euo pipefail
usage() {
    cat <<'USAGE'
usage: check.sh [--quick] | --help
The quality gate. CI runs exactly this script; humans run `just check`, hooks run `--quick`.
  check.sh --quick   the repository guards (vitest project gate), palette.css up to date, and tsc, eslint and shellcheck
                     only for what changed; no browser
  check.sh           every check over the whole repository: guards, tsc, eslint, unit tests (jsdom), stories as tests with
                     axe (Chromium), prettier, knip, palette.css up to date, the package (package.sh: pnpm pack, publint,
                     attw, a consumer app that installs the tarball), visual regression with axe and the font test
                     (visual.sh, in the pinned Playwright image), a changeset for a change of src/ (changeset status),
                     acceptance criteria guarded, shellcheck and gitleaks
What changed is what differs from where this branch left master, committed or not, plus new untracked files.
The quick gate has a time budget, CHECK_QUICK_LIMIT seconds (default 20): the Stop hook runs it after every turn of an
agent, and a gate that takes minutes gets switched off. Above the budget it fails and says so: move the slow step to the
full gate or make it faster; raise the budget only on a machine that is slow across the board.
Every step has a hard ceiling (CHECK_STEP_LIMIT seconds overrides them all); a step above it is killed and fails as
"hung or too slow"; without `timeout` on the machine there is no ceiling. A failed step does not stop the others.
Quiet: a green gate prints one line. Otherwise it lists only the failed and skipped steps (passed ones are counted),
after the tail of each failed log: whoever reads it, often an agent's context, pays only for what needs fixing.
A step that cannot run (a tool is missing) is SKIP, never PASS; with CI set a SKIP fails the gate, locally the report ends with
"NOT VERIFIED: <steps>". Exit code is non-zero on any failure.
Acceptance criteria are not in --quick: the Stop hook runs it after every turn, and a criterion written into
a spec before its guardrail (or one the owner must first decide on) would block the agent from stopping to ask.
USAGE
}
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

QUICK=0
case "${1:-}" in
    "") ;;
    --quick) QUICK=1 ;;
    --help)
        usage
        exit 0
        ;;
    *)
        usage >&2
        exit 2
        ;;
esac

LOGS="$(mktemp -d)"
trap 'rm -rf "$LOGS"' EXIT
FAILURE_LINES=25
ORDER=()
declare -A NAME
declare -A SKIPPED
declare -A LIMIT
QUICK_LIMIT="${CHECK_QUICK_LIMIT:-20}"
case "$QUICK_LIMIT" in
    '' | *[!0-9]*)
        echo "check.sh: CHECK_QUICK_LIMIT must be a whole number of seconds, not '$QUICK_LIMIT'" >&2
        exit 2
        ;;
esac

declare_step() {
    ORDER+=("$1")
    NAME["$1"]="$2"
    LIMIT["$1"]="$3"
}

run_step() {
    local key="$1" function="$2" start status=0
    start=$SECONDS
    if command -v timeout >/dev/null 2>&1; then
        timeout -k 10 "${CHECK_STEP_LIMIT:-${LIMIT[$key]}}" bash -c "$function" >"$LOGS/$key.log" 2>&1 || status=$?
        if [ "$status" -eq 124 ]; then
            echo "hung or too slow: $function exceeded ${CHECK_STEP_LIMIT:-${LIMIT[$key]}} s and was killed" >>"$LOGS/$key.log"
        fi
    else
        bash -c "$function" >"$LOGS/$key.log" 2>&1 || status=$?
    fi
    echo "$status $((SECONDS - start))" >"$LOGS/$key.result"
}

changed_files() {
    cd "$ROOT"
    local base
    base="$(git merge-base HEAD master 2>/dev/null || git rev-parse --verify -q HEAD || true)"
    {
        if [ -n "$base" ]; then git diff --name-only --diff-filter=d "$base"; else git ls-files --cached; fi
        git ls-files --others --exclude-standard
    } | sort -u
}

code_changed_files() { changed_files | grep -E '\.(ts|tsx|js|mjs|cjs)$' || true; }

guards() { cd "$ROOT" && pnpm exec vitest run --project gate; }

palette() { cd "$ROOT" && node scripts/.internal/palette.ts --check; }

typecheck() { cd "$ROOT" && pnpm exec tsc --noEmit -p tsconfig.json && pnpm exec tsc --noEmit -p tsconfig.node.json; }

typecheck_changed() {
    if [ -n "$(code_changed_files)" ]; then typecheck; fi
}

lint() { cd "$ROOT" && pnpm exec eslint . --max-warnings 0; }

lint_changed() {
    local files
    mapfile -t files < <(code_changed_files)
    if [ "${#files[@]}" -gt 0 ]; then
        cd "$ROOT" && pnpm exec eslint --no-warn-ignored --max-warnings 0 "${files[@]}"
    fi
}

shell_changed() {
    cd "$ROOT"
    local files
    mapfile -t files < <(changed_files | grep -E '\.sh$|^\.githooks/pre-commit$' || true)
    if [ "${#files[@]}" -gt 0 ]; then
        shellcheck -S warning "${files[@]}"
    fi
}

shell_scripts() { cd "$ROOT" && { git ls-files --cached --others --exclude-standard '*.sh'; echo .githooks/pre-commit; } | xargs shellcheck -S warning; }

unit_tests() { cd "$ROOT" && pnpm exec vitest run --project unit; }

story_tests() { cd "$ROOT" && pnpm exec vitest run --project stories; }

formatting() { cd "$ROOT" && pnpm exec prettier --check --log-level warn .; }

dead_code() { cd "$ROOT" && pnpm exec knip; }

package_as_installed() { "$ROOT/gate/scripts/package.sh"; }

visual() { "$ROOT/gate/scripts/visual.sh"; }

changeset() {
    cd "$ROOT"
    local base=""
    if git rev-parse --verify -q origin/master >/dev/null; then
        base=origin/master
    elif git rev-parse --verify -q master >/dev/null; then
        base=master
    fi
    if [ -z "$base" ] || [ "$(git rev-parse HEAD 2>/dev/null)" = "$(git rev-parse "$base")" ]; then
        echo "on $base itself or no master yet: nothing to compare with"
        return 0
    fi
    pnpm exec changeset status --since "$base"
}

acceptance_criteria() { "$ROOT/gate/scripts/criteria.sh"; }

secrets_in_git() {
    cd "$ROOT"
    if git rev-parse --verify HEAD >/dev/null 2>&1; then
        gitleaks git . --no-banner --redact --log-level warn
    fi
    gitleaks dir . --no-banner --redact --log-level warn --max-target-megabytes 1
}

export ROOT
export -f changed_files code_changed_files guards palette typecheck typecheck_changed lint lint_changed shell_changed shell_scripts
export -f unit_tests story_tests formatting dead_code package_as_installed visual changeset acceptance_criteria secrets_in_git
if [ "$QUICK" -eq 1 ]; then
    declare_step guards "repository guards (vitest project gate)" 120
    declare_step palette "palette.css generated from @catppuccin/palette (palette.ts --check)" 60
    declare_step tsc "typecheck if code changed (tsc)" 120
    declare_step eslint "lint changed files (eslint)" 180
    declare_step shellcheck "changed shell scripts (shellcheck)" 60
    command -v shellcheck >/dev/null 2>&1 || SKIPPED[shellcheck]="shellcheck not installed"
else
    declare_step guards "repository guards (vitest project gate)" 180
    declare_step palette "palette.css generated from @catppuccin/palette (palette.ts --check)" 60
    declare_step tsc "typecheck (tsc: browser code, node code)" 180
    declare_step eslint "lint (eslint strict, no comments, component boundaries)" 300
    declare_step unit "unit tests (vitest project unit, jsdom)" 300
    declare_step stories "stories as tests with axe (vitest project stories, Chromium)" 600
    declare_step prettier "format (prettier --check)" 180
    declare_step knip "dead code and unused dependencies (knip)" 180
    declare_step package "the package as an app installs it (package.sh: pnpm pack, publint, attw, consumer app)" 900
    declare_step visual "visual regression, axe and the font test of every story (visual.sh, Playwright image)" 900
    declare_step changeset "a changeset for a change of src/ since master (changeset status)" 120
    declare_step criteria "acceptance criteria guarded (criteria.sh)" 60
    declare_step shellcheck "shell scripts (shellcheck)" 120
    declare_step gitleaks "secrets in git (gitleaks)" 300
    command -v shellcheck >/dev/null 2>&1 || SKIPPED[shellcheck]="shellcheck not installed"
    command -v gitleaks >/dev/null 2>&1 || SKIPPED[gitleaks]="gitleaks not installed"
    command -v docker >/dev/null 2>&1 || SKIPPED[visual]="docker (or podman as docker) not installed: the screenshots are taken in the pinned Playwright image"
    if ! command -v python3 >/dev/null 2>&1; then
        SKIPPED[criteria]="python3 not installed"
    else
        fetched=0
        "$ROOT/gate/scripts/criteria.sh" --fetch >/dev/null 2>&1 || fetched=$?
        criteria_tool_cannot_be_downloaded=3
        if [ "$fetched" -eq "$criteria_tool_cannot_be_downloaded" ]; then SKIPPED[criteria]="the pinned vdoc.py cannot be downloaded (no network?)"; fi
    fi
fi

if command -v pnpm >/dev/null 2>&1; then
    [ -d "$ROOT/node_modules" ] || (cd "$ROOT" && pnpm install --frozen-lockfile --silent)
else
    for key in guards palette tsc eslint unit stories prettier knip package visual changeset; do
        if [ -n "${LIMIT[$key]+x}" ]; then SKIPPED[$key]="pnpm not installed"; fi
    done
fi

GATE_START=$SECONDS
PIDS=()
launch() {
    local key="$1"
    if [ -z "${SKIPPED[$key]+x}" ]; then
        run_step "$key" "$2" &
        PIDS+=($!)
    fi
}
if [ "$QUICK" -eq 1 ]; then
    launch guards guards
    launch palette palette
    launch tsc typecheck_changed
    launch eslint lint_changed
    launch shellcheck shell_changed
else
    launch guards guards
    launch palette palette
    launch tsc typecheck
    launch eslint lint
    launch unit unit_tests
    launch stories story_tests
    launch prettier formatting
    launch knip dead_code
    launch package package_as_installed
    launch visual visual
    launch changeset changeset
    launch criteria acceptance_criteria
    launch shellcheck shell_scripts
    launch gitleaks secrets_in_git
fi
for pid in "${PIDS[@]}"; do wait "$pid" || true; done
TOTAL=$((SECONDS - GATE_START))
OVER_BUDGET=0
if [ "$QUICK" -eq 1 ] && [ "$TOTAL" -gt "$QUICK_LIMIT" ]; then OVER_BUDGET=1; fi

FAILED=0
PASSED=0
NOT_VERIFIED=()
REPORT=()
FAILURES=()
for key in "${ORDER[@]}"; do
    if [ -n "${SKIPPED[$key]+x}" ]; then
        if [ -n "${CI:-}" ]; then
            REPORT+=("FAIL        ${NAME[$key]} — ${SKIPPED[$key]} (CI: a skipped step fails)")
            FAILED=1
        else
            REPORT+=("SKIP        ${NAME[$key]} — ${SKIPPED[$key]}")
            NOT_VERIFIED+=("$key")
        fi
        continue
    fi
    read -r status secs <"$LOGS/$key.result"
    if [ "$status" -eq 0 ]; then
        PASSED=$((PASSED + 1))
    else
        REPORT+=("$(printf 'FAIL %4ss  %s' "$secs" "${NAME[$key]}")")
        FAILURES+=("${NAME[$key]}" "$LOGS/$key.log")
        FAILED=1
    fi
done
if [ "$OVER_BUDGET" -eq 1 ]; then
    REPORT+=("FAIL ${TOTAL}s  the quick gate is over its budget of ${QUICK_LIMIT}s: move the slow step to the full gate or speed it up; a first run after a reboot or on a fresh checkout may exceed it once; a machine that is slow across the board runs with CHECK_QUICK_LIMIT=<seconds>")
    FAILED=1
fi

for ((i = 0; i < ${#FAILURES[@]}; i += 2)); do
    echo
    echo "==================== failed: ${FAILURES[i]} (last $FAILURE_LINES lines) ===================="
    tail -n "$FAILURE_LINES" "${FAILURES[i + 1]}"
done

if [ ${#REPORT[@]} -eq 0 ]; then
    echo "PASS check.sh${1:+ $1}: all $PASSED steps in ${TOTAL}s"
else
    echo
    for line in "${REPORT[@]}"; do
        echo "  $line"
    done
    echo "  $PASSED passed, total ${TOTAL}s"
fi
if [ ${#NOT_VERIFIED[@]} -gt 0 ]; then
    echo "NOT VERIFIED: ${NOT_VERIFIED[*]}"
fi
exit "$FAILED"
