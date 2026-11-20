# Development

## Requirements

- Node 24 and pnpm 11 (`corepack enable`), `just`.
- A POSIX shell: on Windows use Git Bash (the steps of the gate and the scripts in `scripts/.internal/` are bash). Agents call
  `pnpm exec suwgate check` and the scripts directly, humans use `just`.
- Once per machine `pnpm exec playwright install chromium` (`just sync` does it), for the story tests and the consumer test.
- Docker or Podman (as `docker`) for the visual tests: they run in `mcr.microsoft.com/playwright:v1.65.1-noble`, so a screenshot
  taken on a laptop matches CI.
- For the full gate: `shellcheck`, `gitleaks`, `python3` and `curl`. A missing tool is reported as SKIP, a failure in CI.

## Everyday commands

```sh
just                  # every recipe, grouped
just storybook        # every component in every state, on http://localhost:6006
just check-quick      # the guards, palette, and tsc, eslint, shellcheck for what changed: seconds
just check            # the whole gate, the same CI runs
just visual-update    # record the screenshots again after a deliberate change of the look
just changeset        # describe a change of src/ for the next release
just palette          # regenerate src/theme/palette.css
```

The same without `just`: `pnpm exec suwgate check --quick`, `pnpm exec suwgate check` (`--verbose` lists every step);
`pnpm exec suwgate step <step> [-- <tool args>]` runs one step and the steps it needs (`pnpm exec suwgate step visual`). The
gate is [suwgate](https://github.com/Manomenu/suwgate): `suwgate.yml` names the `library` profile, the steps this library adds
(`palette`, `library-guards`) and the settings of its guards; suwgate's README says what each step and guard checks.

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
4. **The full gate checks the link both ways** (`suwgate check`, not `--quick`, so an agent can stop and ask
   about a criterion mid-work):

| The gate fails when                                                                          | What to do                                                         |
| :------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| a criterion has no guardrail                                                                 | name its id in a test or rule that fails when the criterion breaks |
| a guardrail names an id no spec defines                                                      | restore the criterion, or delete or rename the id                  |
| an id stands where nothing is checked (production code, a config no tool reads)              | move it to the guardrail that proves the criterion                 |
| a spec has no acceptance section, a criterion without an id or with two, an id defined twice | fix the spec (`vdoc.py ids` numbers new criteria)                  |

**How it runs.** The check is `vdoc.py criteria` of the
[suwagent plugin](https://github.com/Manomenu/suwalski-agent-plugin). The `criteria` step of suwgate
downloads it at the commit and SHA-256 suwgate pins (into `~/.cache/suwagent/`), the same on a laptop and in
CI, and runs it with the library profile's kinds plus those of `criteria.json`. A new suwgate version moves the pin;
without a network the step is a SKIP locally and a failure in CI.

What it cannot see: whether a guardrail would really fail when the behaviour breaks.
`/suwagent:visual-guardrails` checks that before a merge.

## Kinds of guardrail

A spec's acceptance criterion is guarded by one of these: the kinds of suwgate's library profile, and `gate test (vitest)`,
which `criteria.json` adds:

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

`.claude/settings.json` runs `suwgate hook stop` when Claude stops: the quick gate, which blocks the stop while it fails. It
has a budget of 20 seconds and fails above it (`SUWGATE_QUICK_LIMIT=<seconds>` raises it on a machine that is slow across the
board), and it is not run again while nothing changed since it last passed. It costs what the change costs: the repository
guards, the palette and the library's guards, plus tsc, eslint and shellcheck only for what differs from where the branch left
`master`. No browser; the tests that prove acceptance criteria run only in the full gate.

`suwgate hook guard-edit` refuses an agent's edit of the gate, the lint, type, test and release configs, `gate/` and the
visual tests (`ALLOW_GATE_EDIT=1 claude` lifts it for one session), of the lockfile, of the generated palette and of the
recorded screenshots, each with the command that regenerates it. It guards only this project's files.

`.githooks/pre-commit` runs `suwgate hook pre-commit`: gitleaks on what is being committed (a secret found after the push is
already on GitHub and in every clone), then the quick gate.

## Personal agent rules

Rules that are yours alone (how you commit, which tools you use) go in `CLAUDE.local.md`:
Claude Code loads it, and git ignores it.

## Worktrees

Two checkouts (agents in worktrees) can run the full gate at once: the visual tests run inside their own container, and the
consumer test serves its app on a free port of 127.0.0.1.

## Editors

VS Code: accept the recommended extensions (`.vscode/extensions.json`); formatting, tasks and debug launch (Storybook,
unit tests) are set up. Other editors get everything from `.editorconfig` and the repository's configs.
Personal files (.idea/) are ignored.

## Releasing

Changesets keeps the version and the CHANGELOG. On `master`, CI opens or updates a "Version Packages" pull request that
applies the waiting changesets; merging it makes CI publish to npmjs.com through npm trusted publishing (OIDC, no token,
provenance attached). The first version is published by hand, once: see the README.
