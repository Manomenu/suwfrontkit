# Development

## Requirements

- Node 24 and pnpm 11 (`corepack enable`), `just`.
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

In the app: `pnpm add link:../suwfrontstyle`; here: `pnpm exec tsc -p tsconfig.build.json -w` after one `pnpm run build`
(the theme CSS is copied by the build). Tailwind follows the link to `dist/`. A `link:` or `file:` never reaches the app's commit.

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

## Releasing

Changesets keeps the version and the CHANGELOG. On `master`, CI opens or updates a "Version Packages" pull request that
applies the waiting changesets; merging it makes CI publish to npmjs.com through npm trusted publishing (OIDC, no token,
provenance attached). The first version is published by hand, once: see the README.
