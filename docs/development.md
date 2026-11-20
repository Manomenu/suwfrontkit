# Development

## Requirements

- Node 24 and pnpm 11 (`corepack enable`), `just`.
- A POSIX shell: on Windows use Git Bash (the scripts in `gate/scripts/` and `scripts/.internal/` are bash; run them with
  `bash gate/scripts/check.sh`). Agents call the scripts directly, humans use `just`.
- Once per machine `pnpm exec playwright install chromium` (`just sync` does it), for the story tests and the consumer test.
- Docker or Podman (as `docker`) for the visual tests: they run in `mcr.microsoft.com/playwright:v1.65.1-noble`, so a screenshot
  taken on a laptop matches CI.
- For the full gate: `shellcheck`, `gitleaks` and `python3`. A missing tool is reported as SKIP (a failure in CI), and the
  report ends with `NOT VERIFIED: <steps>`.

## Everyday commands

```sh
just                  # every recipe, grouped
just storybook        # every component in every state, on http://localhost:6006
just check-quick      # guards, palette, and tsc, eslint, shellcheck for what changed: seconds
just check            # the whole gate, the same CI runs
just visual-update    # record the screenshots again after a deliberate change of the look
just package --shots /tmp/shots   # the consumer app, with screenshots of the AppShell at 1920x1080 and 3440x1440
just changeset        # describe a change of src/ for the next release
just palette          # regenerate src/theme/palette.css
```

The same without `just`: `bash gate/scripts/check.sh --quick`, `bash gate/scripts/check.sh`.

## Working next to an app

In the app: `pnpm add link:../suwfrontkit`; here: `pnpm exec tsc -p tsconfig.build.json -w` after one `pnpm run build`
(the theme CSS is copied by the build). Tailwind follows the link to `dist/`. A `link:` or `file:` never reaches the app's commit.

## Spec ↔ guardrails sync

Development is spec-driven, and the gate keeps the code and the specs from drifting apart. A spec in
`docs/visual/spec/` (written with the suwagent `/suwagent:visual-spec` skill) says what to build and
why; its acceptance criteria are the contract:

1. **Every criterion has an id**, `AC-<feature>-<n>`, at the start of its item in the spec's
   acceptance section. `vdoc.py ids` of the suwagent plugin assigns them and never reuses a number;
   an id stays with its criterion for good.
2. **Outside the spec, a criterion lives only as a guardrail** that names its id: a test, a story, a lint
   rule. Not as a checklist or a QA note. A criterion that no automated check can prove is
   reworded into plain description or dropped from the spec (the agent asks the owner which).
3. **A spec written ahead of its feature is a draft** in `docs/draft/spec/`: the gate reads only `docs/visual/spec/`,
   where every criterion without a guardrail fails it. The draft moves there when its feature is built, together
   with its tests.
4. **The full gate checks the link both ways** (`check.sh`, not `--quick`, so an agent can stop and ask
   about a criterion mid-work):

| The gate fails when                                                                          | What to do                                                         |
| :------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| a criterion has no guardrail                                                                 | name its id in a test or rule that fails when the criterion breaks |
| a guardrail names an id no spec defines                                                      | restore the criterion, or delete or rename the id                  |
| an id stands where nothing is checked (production code, a config no tool reads)              | move it to the guardrail that proves the criterion                 |
| a spec has no acceptance section, a criterion without an id or with two, an id defined twice | fix the spec (`vdoc.py ids` numbers new criteria)                  |

**How it runs.** The check is `vdoc.py criteria` of the
[suwagent plugin](https://github.com/Manomenu/suwalski-agent-plugin). `gate/scripts/criteria.sh`
downloads it at the commit and SHA-256 it pins (into `~/.cache/suwagent/`), the same on a laptop and in
CI, and runs it with `gate/criteria.json`. `just criteria-update` moves the pin to the plugin's newest
version; without a network the step is a SKIP locally and a failure in CI.

What it cannot see: whether a guardrail would really fail when the behaviour breaks.
`/suwagent:visual-guardrails` checks that before a merge.

## Kinds of guardrail

A spec's acceptance criterion is guarded by one of these (`gate/criteria.json`):

| Kind                            | Where                     | How it names the id                             |
| :------------------------------ | :------------------------ | :---------------------------------------------- |
| `unit test (vitest)`            | `src/**/*.test.ts(x)`     | the id in the title: `it("AC-x-n: …")`          |
| `story test (vitest, Chromium)` | `src/**/*.stories.tsx`    | the id in the story's name: `name: "AC-x-n: …"` |
| `visual test (playwright)`      | `visual/*.visual.ts`      | the id in the title: `test("AC-x-n: …")`        |
| `consumer test (playwright)`    | `gate/consumer/*.spec.ts` | the id in the title: `test("AC-x-n: …")`        |
| `gate test (vitest)`            | `gate/guards/*.test.ts`   | the id in the title: `it("AC-x-n: …")`          |
| `lint (eslint)`                 | `eslint.config.js`        | `// AC-x-n` on the line above the rule          |
| `type check (tsc)`              | `tsconfig*.json`          | `// AC-x-n` on the line above the option        |

## Claude Code hooks

`.claude/settings.json` runs `gate/scripts/check.sh --quick` when Claude stops, and blocks the stop while it fails (the
loop is cut after one retry). The quick gate has a budget of 20 seconds and fails above it; `CHECK_QUICK_LIMIT=<seconds>`
raises it on a machine that is slow across the board. When the working tree is exactly as it was at the last green quick
gate (same HEAD, same changes, same untracked files), the hook does not run it again; HEAD counts, because a change
committed in the same turn leaves `git status` clean. It costs what the change costs: the repository guards and the palette,
plus tsc, eslint and shellcheck only for what differs from where the branch left `master` (committed or not, and new files).
No browser; the tests that prove acceptance criteria run only in the full gate.

A second hook refuses an agent's edit of the gate, the lint, type, test and release configs (`ALLOW_GATE_EDIT=1 claude`
lifts it for one session), of the lockfile, of the generated palette and of the recorded screenshots, each with the command
that regenerates it. It guards only this project's files (`CLAUDE_PROJECT_DIR`, or the checkout the script sits in), so a
session started here can still edit another project's configs.

`.githooks/pre-commit` runs gitleaks on what is being committed: the full gate and CI run it too, but a secret found after the
push is already on GitHub and in every clone.

## Personal agent rules

Rules that are yours alone (how you commit, which tools you use) go in `CLAUDE.local.md`:
Claude Code loads it, and git ignores it.

## Worktrees

Two checkouts (agents in worktrees) can run the full gate at once: the visual tests run inside their own container, and the
consumer test serves its app on a free port of 127.0.0.1 (`package.sh`).

## Editors

VS Code: accept the recommended extensions (`.vscode/extensions.json`); formatting, tasks and debug launch (Storybook,
unit tests) are set up. Other editors get everything from `.editorconfig` and the repository's configs.
Personal files (.idea/) are ignored.

## Releasing

Changesets keeps the version and the CHANGELOG. On `master`, CI opens or updates a "Version Packages" pull request that
applies the waiting changesets; merging it makes CI publish to npmjs.com through npm trusted publishing (OIDC, no token,
provenance attached). The first version is published by hand, once: see the README.
