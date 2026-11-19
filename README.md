# suwfrontstyle

`@maniumek/suwfrontstyle`: the look of our desktop web apps in one package. Catppuccin Mocha design tokens under the
shadcn-style names the apps already use (`bg-primary`, `text-muted-foreground`, `bg-info-light`), a Tailwind 4 theme,
Inter Variable that really loads, and React 19 components: Button, Badge, Alert, Input, Textarea, Select, Label, Field,
Legend, InfoTip, Table, Paper, Panel, Page, StickyActions, Paginated, Anchor, and AppShell with NavLink.

Desktop only (16:9 and 21:9 screens), dark only. Every component is in Storybook (`just storybook`).

## Use it in an app

The app needs React 19, Tailwind 4.3 or newer with its Vite plugin, and pnpm.

```sh
pnpm add --save-exact @maniumek/suwfrontstyle
```

`pnpm-workspace.yaml` of the app, so a release is installable on the day it comes out (pnpm 11 waits a day otherwise):

```yaml
minimumReleaseAgeExclude:
    - "@maniumek/suwfrontstyle"
```

The app's CSS entry (`src/index.css`) is these two lines and nothing else of the theme:

```css
@import "tailwindcss";
@import "@maniumek/suwfrontstyle/theme.css";
```

`theme.css` brings the tokens, `color-scheme: dark`, the base styles and Inter Variable (the app's bundler serves the
woff2 from the app's own origin, so `font-src 'self'` is enough), and it tells Tailwind where the components' classes
are. Never import it inside `layer()`, `supports()` or a media query: Tailwind then refuses its `@source`.

```tsx
import { AppShell, Button, NavLink, Page } from "@maniumek/suwfrontstyle";
import { Building2, ChartLine, FileText } from "lucide-react";
import { Link } from "wouter";

export function Shell({ children }: { children: React.ReactNode }) {
    return (
        <AppShell
            appIcon={<ChartLine />}
            appTitle="myapp"
            home={(link) => <Link href="/" {...link} />}
            headerEnd={<span>signed in as maniumek</span>}
            panel={
                <nav aria-label="Main">
                    <NavLink asChild icon={<Building2 />} label="Companies" current>
                        <Link href="/" />
                    </NavLink>
                    <NavLink asChild icon={<FileText />} label="Theses" current={false}>
                        <Link href="/theses" />
                    </NavLink>
                </nav>
            }
            panelLabel="Navigation panel"
            storageKey="myapp.navigation-panel"
        >
            {children}
        </AppShell>
    );
}

export function Companies() {
    return <Page title="Companies" actions={<Button>Add a company</Button>} />;
}
```

- The header always shows the app's icon and title, as a link home; `appIcon` and `appTitle` are required, so an app without
  them does not compile. `home` renders that link with the app's router (`(link) => <a href="/" {...link} />` without one);
  whatever else the header needs goes to `headerEnd`, on the right.
- Every `NavLink` needs an `icon` and a `label`. The expanded panel shows both; the collapsed panel is a strip of the icons,
  each named by its label and showing it in a tooltip, with `aria-current` in both states. With `asChild` the router's link
  is the child, empty: NavLink puts the icon and the label into it.
- The library ships no icons: pass any React element, an inline `<svg>`, an `<img>` or an icon set such as
  [lucide-react](https://lucide.dev/guide/packages/lucide-react). The shell sizes them (28 px in the header, 20 px in the panel).
- `AppShell` remembers the collapsed panel under `storageKey` in `localStorage`; it starts expanded. It knows no router:
  the app passes its own `<nav>`.
- `Page` fills the width (`width="full"`, for tables and charts on wide screens); `width="reading"` keeps forms and text at
  about 80 characters.
- Pin the exact version: every change of the look is a pull request in the app, through its own tests.

### Moving to the AppShell with icons

A breaking change: the header and the navigation now require icons.

- `header` is gone. Pass `appIcon` (the app's icon), `appTitle` (its name) and `home` (the link to the start page); anything
  else that was in the header goes to `headerEnd`.
- `NavLink` takes `icon` and `label`; the text no longer goes in its children. `<NavLink href="/" current>Companies</NavLink>`
  becomes `<NavLink href="/" icon={<Building2 />} label="Companies" current />`, and with `asChild` the router's link stays
  the child, without text: `<NavLink asChild icon={<Building2 />} label="Companies" current><Link href="/" /></NavLink>`.
- The panel stays in the page when collapsed (as the strip of icons): a test that expected the navigation to disappear now
  finds the links by their labels.

## Develop

[docs/development.md](docs/development.md): requirements, commands, working next to an app with `link:`.
Rules for changing the library: [AGENTS.md](AGENTS.md). How it is built: [docs/architecture.md](docs/architecture.md).

## Release

Changesets and npm trusted publishing from GitHub Actions (`.github/workflows/ci.yml`): merge the "Version Packages"
pull request that CI keeps open, and CI publishes with provenance.

The first version is published by hand, once, because npm configures a trusted publisher on a package that exists:

1. Create the public GitHub repository Manomenu/suwfrontstyle and push `master`. In its Settings, Actions, General, allow
   GitHub Actions to create and approve pull requests.
2. On this machine, logged in to npm as `maniumek` with two-factor authentication: `npm login`, then
   `pnpm publish --access public`. This publishes 0.0.0 (`prepack` builds `dist/` first).
3. On npmjs.com, the package's Settings, Trusted Publisher, GitHub Actions: organization or user `Manomenu`, repository
   `suwfrontstyle`, workflow filename `ci.yml`, no environment, and allow `npm publish` (new configurations allow only
   staged publishing until it is ticked).
4. Within two days (an unused configuration expires): merge the "Version Packages" pull request that CI opened from the
   waiting changeset. CI publishes 0.1.0 through OIDC, with provenance.
5. Then, in the package's Settings, Publishing access: require two-factor authentication and disallow tokens.
