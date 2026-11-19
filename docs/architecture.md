# Architecture

## The map

One line per top-level folder (at most 300 characters each). `repositoryLayout.test.ts` reads these
lines: a new top-level folder needs its line here, a deleted one loses it.

- `src/` — the library: one folder per component (the component, its story, its test), `theme/` (the generated Catppuccin palette, `theme.css` with the semantic tokens, the Tailwind theme and Inter), `classNames.ts` (`cn`), and `index.ts`, the public API.
- `gate/` — the quality machinery: `scripts/` (the gate, the Claude Code hooks, the criteria check, the package and visual checks), `guards/` (repository guards as Vitest tests), `consumer/` (an app that installs the packed tarball), `criteria.json`.
- `visual/` — Playwright tests over the built Storybook, run in the pinned Playwright image: every story against its screenshot in `snapshots/` at 1920x1080 and 3440x1440 with axe, and the font test.
- `scripts/` — `scripts/.internal/` holds tools the gate and `just` run: `palette.ts` generates `src/theme/palette.css`; the gate refuses a script nothing calls (`scriptsCalled.test.ts`).
- `.storybook/` — Storybook for React and Vite: the stories of `src/`, the a11y addon failing a story test on any violation, and the CSS that loads Tailwind with the theme.
- `.changeset/` — changesets: one Markdown file per change waiting for the next release, and the config (public access, base branch `master`, only `src/` needs a changeset).
- `.github/` — `workflows/ci.yml`: the gate on every push and pull request, then on `master` the release: changesets opens the "Version Packages" pull request, and after its merge publishes with npm trusted publishing.
- `.claude/` — the committed Claude Code settings: a Stop hook that runs the quick gate, a PreToolUse hook that protects generated files and the gate with the lint configs (`ALLOW_GATE_EDIT=1 claude` lifts the last).
- `.githooks/` — `pre-commit` runs gitleaks on what is being committed; `just sync` enables it.
- `.vscode/` — the editor's glue, shared: recommended extensions, formatter per language, file nesting, tasks that call the gate. No style rules.
- `docs/` — documentation for people working on the repo: this map, `development.md`, the specs in `visual/spec/`, decisions in `adr/`.

Files at the root: `package.json` (the published manifest: exports, peers, dependencies), `tsconfig.json` (browser code),
`tsconfig.node.json` (code that runs in Node), `tsconfig.build.json` (what `tsc` emits into `dist/`), `vite.config.ts`
(React and Tailwind for Storybook and Vitest), `vitest.config.ts` (projects `unit`, `stories`, `gate`), `eslint.config.js`,
`.prettierrc.json`, `knip.json`, `.editorconfig`, `.gitattributes`, `.gitignore`.

## What ships

The tarball holds `dist/` only: ESM JavaScript and type declarations per source file, emitted by `tsc`, and `theme/theme.css` with
`theme/palette.css`, copied as they are. No bundler: components import no CSS, and the app's Vite tree-shakes them.

- The theme (`theme.css`) imports Inter Variable from `@fontsource-variable/inter` (the app's bundler serves the woff2 from its own
  origin, which fits `font-src 'self'`), the palette, and names `dist/` as a Tailwind source, so the app's Tailwind finds the
  classes of the components without a line of its own.
- The app writes two lines: `@import "tailwindcss";` and `@import "@maniumek/suwfrontstyle/theme.css";`, never inside
  `layer()`, `supports()` or a media query, where Tailwind refuses `@source`.
- Semantic tokens keep the names the apps already use (`--primary`, `--muted-foreground`, `--info`); each points at a
  Catppuccin Mocha colour (`--ctp-*`), and tints are `color-mix()` of two of them.

## The gate

Quality machinery lives apart from what it checks, for two reasons: a guard tests the whole repository, and an agent
that cannot pass a guard must not be able to change it.

- Belongs in the gate: anything that decides whether a change passes. A tool for everyday work stays in `scripts/`.
- A hook refuses an agent's edit of the whole `gate/` folder and of the lint, type, test and release configs. The owner
  lifts it for one session with `ALLOW_GATE_EDIT=1 claude`.

## What the gate forbids

Each line is a lint rule, a type check or a test; its message says the fix.

- Code (`check.sh`): tsc strict, eslint (typescript-eslint strict type-checked, React hooks, component boundaries: a component imports only `classNames.ts` and the components its policy names, such as Field to Label and InfoTip), Prettier with Tailwind class order, knip.
- Comments (the local no-comments rule of eslint for TypeScript and JavaScript, `comments.test.ts` for CSS, JSON, YAML, shell, justfile, HTML and ignore files): only the tool directives of AGENTS.md.
- Browser storage (eslint): `localStorage`, `sessionStorage` and `indexedDB` only in the remembered navigation panel.
- In-place switches (`noPragma.test.ts`): no `@ts-ignore`, `@ts-nocheck` or `eslint-disable` in the code.
- Public API (`publicApi.test.ts`): every component folder is exported and has a story and a test.
- Colours (`noRawColors.test.ts`): no hex, `rgb()` or arbitrary colour class in `src/`.
- Palette (`palette.ts --check`): `palette.css` equals what the installed `@catppuccin/palette` gives.
- Stories (`stories` project): each story renders in Chromium and passes axe (`a11y.test: "error"`).
- Visual (`visual.sh`): each story matches its screenshot at 1920x1080 and 3440x1440 and passes axe; Inter Variable is loaded, not only named.
- Package (`package.sh`): publint, attw, and a consumer app that installs the tarball sees styled components, Inter served from its own origin and a panel that remembers its state.
- Release (`changeset status`): a change of `src/` since `master` carries a changeset.
- Names (`forbiddenNames.test.ts`): no folder or file named components, ui, hooks, utils, shared, common and the like.
- Packages (`packages.test.ts`): no Mantine, Emotion, styled-components, MUI, Chakra, classnames, lodash, moment or jQuery.
- Docs (`agentsFile.test.ts`, `repositoryLayout.test.ts`, `docsPaths.test.ts`): AGENTS.md at most 100 lines, no tree drawings, no capitals shouting; CLAUDE.md is `@AGENTS.md`; every top-level folder is in the map above; every path the docs name exists.
- Scripts (`scripts.test.ts`, `scriptsCalled.test.ts`, `justModules.test.ts`): each answers `--help`, each is called by something, modules of the justfile sit where `mod` finds them.
- Acceptance criteria (`criteria.sh`, full gate only): each spec in `docs/visual/spec/` has its criteria named by a guardrail of a kind in `criteria.json`.
- The gate itself (`check.sh`): a ceiling per step, the quick gate fails above its budget (20 s by default) and checks only what changed.

## How code is split

- A new component is a new folder of `src/`, named after what it is, in lower camel case (`appShell`, `infoTip`).
- A component that composes another gets that edge as its own policy in the boundaries rule of `eslint.config.js`.
- Behaviour that is a rule (what is stored, when the panel starts collapsed) lives in a plain module with a test beside it.
