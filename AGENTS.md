# AGENTS.md

Rules for anyone, human or AI agent, changing this repository. `CLAUDE.md` only points here;
this file is the one to edit. Setup: [docs/development.md](docs/development.md). Not built yet: [TODO.md](TODO.md).

This repository is a published library: `@maniumek/suwfrontstyle` on npmjs.com. Its public API (`src/index.ts`,
`theme.css` and every token name in it) is a contract with the apps that install it.

## Commands

- For people: a recipe in `justfile`, with a one-line description; `just` lists them.
- For agents: a script in `scripts/.internal/`, or in `gate/scripts/` when it checks quality; each answers `--help`. A recipe only calls the script.
- `check.sh --quick` while working, `check.sh` before calling a change done.

## Git

- **The main branch is `master`**, never `main`.
- Work on a feature branch, never on `master`. Agents do not rewrite or discard history: no
  amend, reset, rebase, stash, force-push or deleting an unmerged branch. Merging and releasing are the owner's.
- A branch merged into `master` is deleted right after the merge, with `git branch -d`.
- A change with a red gate is not committed: it stays in the working tree and the summary says why.
- One task, one branch. Unrelated refactors, renames, version bumps and fixes go to their own branch or into `TODO.md`.
- Personal rules go in the gitignored `CLAUDE.local.md`, not here.

## Releases

- Every change of `src/` carries a changeset (`just changeset`): patch for a fix, minor for something new, and while the
  version is 0.x also minor for a breaking change, with what an app must change written in the changeset.
- Agents never publish, log in to npm or push. CI publishes with npm trusted publishing after the owner merges the
  "Version Packages" pull request.

## Rules

- KISS and YAGNI first: the library grows only when an app needs it; one developer maintains it after hours. When in doubt, leave it out, and say in the change what was left out and why.
- Desktop only (16:9 and 21:9 screens), dark only (Catppuccin Mocha): no mobile breakpoints, no light theme.
- A component is a folder of `src/` with the component, its story and its test, exported from `src/index.ts`.
- Colours come from the theme's tokens, never from a value written in a component.
- Plan a change by listing what it makes obsolete, and delete that first, in the same change.
- Correction or a new rule? Make the mistake impossible or loud first: a type, a lint, a test, a hook. Add a sentence here only for what none of these can check.
- A guard's message states the fix. Never weaken a guard to make a change pass: fix the change.

## No comments

No comments in project files: agents mostly use comments to excuse bad code and comments rot, so names, small functions, types, stories and tests say what a comment would; if code is unclear without a comment, fix the code.

- Covered: every code and config file (TypeScript, JavaScript, CSS, JSON, YAML, shell, justfile, HTML, ignore files, `.editorconfig`), JSDoc, commented-out code and task markers included. Not covered: Markdown, `docs/` and data strings (UI texts, story texts).
- Not scanned: `pnpm-lock.yaml`, `node_modules`, `dist`, `storybook-static`, `.changeset`, `docs/`.
- Allowed, because a tool reads them (the guards hold the same list):
    - in a justfile, the one line directly above a recipe or `mod` that `just --list` shows;
    - a shebang `#!` on the first line; `# shellcheck <directive>=…` in shell scripts;
    - `// @ts-expect-error <reason>`, `// @vitest-environment <env>`, and `eslint-disable` directives only where nothing else works;
    - a comment that is exactly a criterion id where `criteria.sh` reads it: `// AC-x-n` in `eslint.config.js` and the tsconfigs, `# AC-x-n` in `.editorconfig`.
- A reason that cannot live in code goes into a test, a story, the README, this file or `docs/` as a sentence.

## Specs

A spec's acceptance criteria live as guardrails: `gate/scripts/criteria.sh` and `gate/criteria.json` say what fits, its messages the fix.

- Set ids with `vdoc.py ids`, never by hand: a dropped id is never reused, an id is never renumbered.
- A criterion no automated check can prove is a wrong criterion: ask the owner, never keep it unguarded.
- A criterion gets the lightest check that can fail for it: a unit test before a story test, a story test before a visual test.

## Review

A person also reads the diff when the change touches the always-careful list: the release workflow and publishing,
the public API (a removed or renamed export, prop or token), a recorded screenshot in `visual/snapshots/`.

## Where code goes

[docs/architecture.md](docs/architecture.md). Read it before adding a folder or a component.
Docs say what and why, not where: a line that must change when the code moves does not belong in the docs.

## What no test can check

- Names are chosen word by word, in technical English; one word per thing, everywhere.
- Secrets never enter the repo: not in code, settings, tests or history.
