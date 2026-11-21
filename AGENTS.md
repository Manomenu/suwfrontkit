# AGENTS.md

Rules for anyone, human or AI agent, changing this repository. `CLAUDE.md` only points here;
this file is the one to edit. Setup: [docs/development.md](docs/development.md). Not built yet: [TODO.md](TODO.md).

Read @AGENTS.shared.md first: the rules every repository of the stack shares. This file adds this repository's own and wins where it says otherwise.

This repository is a published library: `@maniumek/suwfrontkit` on npmjs.com. Its public API (`src/index.ts`,
`theme.css` and every token name in it) is a contract with the apps that install it.

## Commands

- For people: recipes also live in a module of the whole repository beside `justfile` (`<name>.just`) or in a tool's folder as `<folder>/mod.just`.
- For agents: a script in `scripts/.internal/`, which a recipe calls. A new check goes into suwgate, or, when only this library has it, into `gate/` and `steps.add` of `suwgate.yml`.
- suwgate runs as `pnpm exec suwgate`, e.g. `pnpm exec suwgate step stories -- src/button` after changing a component.

## Releases

- Every change of `src/` carries a changeset (`just changeset`): patch for a fix, minor for something new, and while the
  version is 0.x also minor for a breaking change, with what an app must change written in the changeset.
- CI publishes with npm trusted publishing after the "Version Packages" pull request is merged.

## Rules

- The library grows only when an app needs it.
- Desktop only (16:9 and 21:9 screens), dark only (Catppuccin Mocha): no mobile breakpoints, no light theme.
- A component is a folder of `src/` with the component, its story and its test, exported from `src/index.ts`.
- Colours come from the theme's tokens, never from a value written in a component.
- Stories say what a comment would, besides names, types and tests; a reason may also go into a story.
- Names are in technical English.

## Specs

A criterion gets a unit test before a story test, a story test before a visual test. `criteria.json` says what fits besides the profiles.

## Review

The always-careful list: the release workflow and publishing, the public API (a removed or renamed export, prop or token), a
recorded screenshot in `visual/snapshots/`.
