# Architecture

## The map

One line per top-level folder (at most 300 characters each). The `repository-layout` guard of suwgate reads these
lines: a new top-level folder needs its line here, a deleted one loses it.

- `src/` — the library: one folder per component (the component, its story, its test), `theme/` (the generated Catppuccin palette, `theme.css` with the semantic tokens, the Tailwind theme and Inter), `classNames.ts` (`cn`), and `index.ts`, the public API.
- `gate/` — the library's own checks, which suwgate runs: `guards/` (the public API and the entry points, Vitest project `gate`) and `consumer/` (the app the `consumer-app` step installs the packed tarball into, and its Playwright test).
- `visual/` — Playwright tests over the built Storybook, run by suwgate's `visual` step in the Playwright image: every story against its screenshot in `snapshots/` at 1920x1080 and 3440x1440 with axe, and the font test.
- `scripts/` — `scripts/.internal/` holds tools the gate and `just` run: `palette.ts` generates `src/theme/palette.css`, `visual-update.sh` records the screenshots again; suwgate refuses a script nothing calls.
- `.storybook/` — Storybook for React and Vite: the stories of `src/`, the a11y addon failing a story test on any violation, and the CSS that loads Tailwind with the theme.
- `.changeset/` — changesets: one Markdown file per change waiting for the next release, and the config (public access, base branch `master`, only `src/` needs a changeset).
- `.github/` — `workflows/ci.yml`: suwgate's reusable gate on every push and pull request, then on `master` its release workflow (changesets opens the "Version Packages" pull request) and the publish job, kept here for npm trusted publishing.
- `.claude/` — the committed Claude Code settings: the Stop hook runs `suwgate hook stop` (the quick gate), the PreToolUse hook `suwgate hook guard-edit` (protects generated files and the gate; `ALLOW_GATE_EDIT=1 claude` lifts the last).
- `.githooks/` — `pre-commit` runs `suwgate hook pre-commit` (gitleaks on what is being committed, then the quick gate); `just sync` enables it.
- `.vscode/` — the editor's glue, shared: recommended extensions, formatter per language, file nesting, debug launch, tasks that call the gate. No style rules (they live in `.editorconfig` and `prettier.config.js`, so every editor agrees).
- `docs/` — documentation for people working on the repo: this map, `development.md`, the specs in `visual/spec/` (their acceptance criteria live as guardrails, see AGENTS.md), drafts of specs ahead of their feature in `draft/spec/`, decisions above one component in `adr/`.

Files at the root: `suwgate.yml` (the gate: the library profile, the steps it adds, the settings of the guards and hooks),
`criteria.json` (the kind of guardrail this library adds), `package.json` (the published manifest: exports, peers,
dependencies), `tsconfig.json` (browser code), `tsconfig.node.json` (code that runs in Node), `tsconfig.build.json` (what `tsc`
emits into `dist/`), `vite.config.ts` (React and Tailwind for Storybook and Vitest), `vitest.config.ts` (projects `unit`,
`stories`, `gate`), `eslint.config.js`, `prettier.config.js`, `knip.config.ts`, `.editorconfig`, `.gitattributes`, `.gitignore`.
The tool configs extend the presets of `@maniumek/suwgate` and keep only what is the library's own.

## What ships

The tarball holds `dist/` only: ESM JavaScript and type declarations per source file, emitted by `tsc`, and `theme/theme.css` with
`theme/palette.css`, copied as they are. No bundler: components import no CSS, and the app's Vite tree-shakes them.

- The theme (`theme.css`) imports Inter Variable from `@fontsource-variable/inter` (the app's bundler serves the woff2 from its own
  origin, which fits `font-src 'self'`), the palette, and names `dist/` as a Tailwind source, so the app's Tailwind finds the
  classes of the components without a line of its own.
- The app writes two lines: `@import "tailwindcss";` and `@import "@maniumek/suwfrontkit/theme.css";`, never inside
  `layer()`, `supports()` or a media query, where Tailwind refuses `@source`.
- The diagram is a second entry point (`@maniumek/suwfrontkit/diagram` with its own CSS), because React Flow, its only
  user, is heavy: `@xyflow/react` is an optional peer, and the main entry never imports it.
- The TanStack Query client is a third (`@maniumek/suwfrontkit/query`), for the same reason: `@tanstack/react-query` is an
  optional peer, so an app without it (the template) builds without it.
- Semantic tokens keep the names the apps already use (`--primary`, `--muted-foreground`, `--info`); each points at a
  Catppuccin Mocha colour (`--ctp-*`), and tints are `color-mix()` of two of them.

## The gate

The gate is suwgate (`@maniumek/suwgate`, pinned to one version): `suwgate check` runs the steps of the `library` profile and
its repository guards, configured in `suwgate.yml`, the same on a laptop, in the hooks and in CI. Only what no other repository
has stays here:

- the `palette` step (`steps.add`): `palette.css` equals what the installed `@catppuccin/palette` gives;
- the `library-guards` step (`steps.add`): `gate/guards/`, the Vitest project `gate`: every component folder is exported (from
  `src/index.ts` or its own entry point) and has a story and a test; the main entry point and `theme.css` reach no optional peer, so
  React Flow stays behind the diagram's own entry point;
- the consumer app in `gate/consumer/`, which the `consumer-app` step builds with the packed tarball: the built CSS holds the
  components' utilities, the theme and Inter; in Chromium the components are styled, Inter is served from the app's own origin, the
  panel remembers its state and the diagram draws in the theme's colours;
- the font test of the visual tests and the recorded screenshots;
- the component boundaries and the browser-storage rule of `eslint.config.js`, on top of suwgate's strict preset;
- the kind of guardrail `gate test (vitest)` in `criteria.json`, on top of the library profile's kinds.

The edit hook refuses an agent's edit of `gate/`, the visual tests and every config of the gate (`settings.hooks` in
`suwgate.yml` adds the library's files to suwgate's list), of the generated palette and of the recorded screenshots.
What suwgate checks, step by step and guard by guard, is in its README.

## Lint rules of the library

eslint runs suwgate's strict preset (`strict()` of `@maniumek/suwgate/eslint`: typescript-eslint's strict type-checked and
stylistic sets, no comments, no inline switches; the rules it loosens and why are in suwgate's docs) and React hooks. A rule that
does not fit is switched off once for every file in `eslint.config.js`, never with an `eslint-disable` comment, and gets its row
in a table here. The library adds two rules of its own:

The component boundaries (`boundaries` in `eslint.config.js`): every folder of `src/` is a component, independent by default; a
component imports only `classNames.ts`, and `index.ts` puts the public API together from the components. When one component
really composes another (Field uses Label and InfoTip, Paginated uses Alert and Button), that edge is its own policy. Stories and
tests are left out: they may render whatever shows the state.

Browser storage (`no-restricted-globals`, `no-restricted-properties` in `eslint.config.js`): a component keeps its state in React
or takes it from the app as a prop, so the app decides what survives a reload. The one exception is the remembered navigation
panel of the AppShell, in its own file, with its test and story.

## Why some settings are as they are

- Line endings: `.gitattributes` keeps LF everywhere whatever the OS (as `.editorconfig`), never normalises binaries, and marks the
  lockfile and the generated palette as generated, so GitHub collapses them in diffs.
- TypeScript: `tsconfig.json` is the browser code (the components, their stories and tests, the Storybook preview),
  `tsconfig.node.json` the code that runs in Node (the configs, the guards, the visual and consumer tests, the palette
  generator), and `tsconfig.build.json` what `tsc` emits into `dist/`. The consumer app is outside all three: it is a copy of an
  app that installs the tarball, so eslint checks it without types.
- pnpm: `pnpm-workspace.yaml` holds pnpm 11's settings (it reads them there, not from `package.json`): esbuild needs its
  postinstall for its platform binary, and approving it in `allowBuilds` keeps installs non-interactive; `unrs-resolver` (from
  eslint-plugin-boundaries) gets its prebuilt binary as an optional package, so its fallback build is not needed.
- CI calls suwgate's reusable workflows (the gate, the npm release) pinned by commit, so action pins and tool versions change
  in one place. The publish job stays in `ci.yml`: npm's trusted publisher checks the calling workflow's file name, and a job that
  talks to the registry with an OIDC token should name this repository's own file. `ci.yml` keeps its name for the same reason.
- VS Code recommends only the extensions of the tools this repository uses: Prettier, ESLint, Tailwind CSS IntelliSense, Vitest,
  Playwright, EditorConfig, ShellCheck, YAML, Containers (the visual tests run in one) and Just.

## Decisions the code relies on

Reasons that would otherwise sit in comments and that no name or test can carry.

- That an app without the diagram builds without React Flow is proven on the sources (`entryPoints.test.ts` walks the imports
  of `src/index.ts` and of `theme.css`), not by a second consumer app: `dist/` is tsc's file-by-file emit of the same imports,
  so a bundle of such an app would prove nothing more.
- The visual tests screenshot a story after its play function: they open it as Storybook's own test-runner does, by emitting
  `setCurrentStory` on the preview's channel and waiting for `storyFinished` (Storybook 10 emits it after the play function,
  the animations and `afterEach`). Opening the story by its URL and waiting for it to show raced the play function, so a
  story's screenshot showed whatever state the play function had reached by then.

## How code is split

- A new component is a new folder of `src/`, named after what it is, in lower camel case (`appShell`, `infoTip`).
- A component that composes another gets that edge as its own policy in the boundaries rule of `eslint.config.js`.
- Behaviour that is a rule (what is stored, when the panel starts collapsed) lives in a plain module with a test beside it.
