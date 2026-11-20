# suwfrontkit

`@maniumek/suwfrontkit`: the look of our desktop web apps in one package. Catppuccin Mocha design tokens under the
shadcn-style names the apps already use (`bg-primary`, `text-muted-foreground`, `bg-info-light`), a Tailwind 4 theme,
Inter Variable that really loads, and React 19 components: Button, Badge, Alert, Input, Textarea, Select, Label, Field,
Legend, InfoTip, Table, Paper, Panel, Page with AppTitle, StickyActions, Paginated, Anchor, AppShell with NavLink, GraphicSplit, History,
Diff, Dialog, ConfirmDialog, ErrorBoundary with ErrorScreen, StatusBadge, ResourceList, ResourceEdit, ToggleChip,
ChipFilter, MultiSelect, formatting of numbers and times on Intl, a typed API client on openapi-fetch with ApiError, a
leave guard for unsaved changes, and FlowDiagram (a workflow diagram) under its own
entry point.

Desktop only (16:9 and 21:9 screens), dark only. Every component is in Storybook (`just storybook`).

## Renamed from suwfrontstyle

The package was `@maniumek/suwfrontstyle` up to 0.1.0 and is now `@maniumek/suwfrontkit`: the same code under a new
name; the old package is deprecated. An app moves over with:

```sh
pnpm remove @maniumek/suwfrontstyle && pnpm add --save-exact @maniumek/suwfrontkit
```

then replaces `@maniumek/suwfrontstyle` with `@maniumek/suwfrontkit` in its imports and in `minimumReleaseAgeExclude`
of its `pnpm-workspace.yaml`. The CSS entry becomes:

```css
@import "tailwindcss";
@import "@maniumek/suwfrontkit/theme.css";
```

## Use it in an app

The app needs React 19, Tailwind 4.3 or newer with its Vite plugin, and pnpm.

```sh
pnpm add --save-exact @maniumek/suwfrontkit
```

`pnpm-workspace.yaml` of the app, so a release is installable on the day it comes out (pnpm 11 waits a day otherwise):

```yaml
minimumReleaseAgeExclude:
    - "@maniumek/suwfrontkit"
```

The app's CSS entry (`src/index.css`) is these two lines and nothing else of the theme (a third for the diagram, below):

```css
@import "tailwindcss";
@import "@maniumek/suwfrontkit/theme.css";
```

`theme.css` brings the tokens, `color-scheme: dark`, the base styles and Inter Variable (the app's bundler serves the
woff2 from the app's own origin, so `font-src 'self'` is enough), and it tells Tailwind where the components' classes
are. Never import it inside `layer()`, `supports()` or a media query: Tailwind then refuses its `@source`.

```tsx
import { AppShell, Button, NavLink, Page } from "@maniumek/suwfrontkit";
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
  about 80 characters. Its `title` also names the browser tab (a React 19 `<title>`, which wins over the one in
  `index.html`); wrap the app once in `<AppTitle value="myapp">` and every tab reads `Companies · myapp`. Render one `Page`
  per screen: two at once give the document two titles.
- `ResourceList` and `ResourceEdit` are the two screens of a resource. They know no router and fetch nothing: links come in
  as render props (`link`, `add`, `back`) that return the app's own `<Link>`, which the library styles; data, state and
  callbacks come in as props; every label has an English default. `ResourceEdit` with `action` (or `onSubmit`) wraps its
  children in the form with the refusal, Save and Cancel in `StickyActions`; without either the children stand alone. Asking
  before leaving unsaved changes stays in the app: it wraps `back` and `onCancel` with `mayLeave()` (below).
- `ResourceEdit` saves through a React form action: `action` gets the form's `FormData`, sync or async, so the fields can be
  uncontrolled (`name` and `defaultValue`). While it runs, Save reads `Saving…` (`pendingLabel`) and is disabled, and a
  second submit is ignored. With `useActionState` the result of the save comes back as the refusal and the mistakes. An
  error thrown by the action goes to the nearest error boundary, as with every React action; after a successful one React
  resets the uncontrolled fields to their `defaultValue`.

    ```tsx
    async function saveCompany(_: Refused | null, form: FormData): Promise<Refused | null> {
        return api.saveCompany(form.get("name"));
    }

    function EditCompany({ company }: { company: Company }) {
        const [refused, save] = useActionState(saveCompany, null);
        return (
            <ResourceEdit
                title={`Company ${company.ticker}`}
                action={save}
                refusal={refused?.refusal ?? null}
                mistakes={refused?.mistakes ?? []}
            >
                <Input aria-label="Name" name="name" defaultValue={company.name} />
            </ResourceEdit>
        );
    }
    ```

    The old way, `onSubmit` with `saving`, still works: the app keeps the fields controlled and sets `saving` itself while it
    saves. Prefer `action` in new screens; one screen takes one of the two, never both.

- `ConfirmDialog` with an `onConfirm` that returns a promise runs it as a transition: the confirm button is busy
  (`pendingLabel`) and Cancel, Escape and a second confirm do nothing until it settles; it closes when the promise resolves
  and stays open when it rejects.
- Choosing several values: `ChipFilter` shows a short, fixed list as chips, all visible at once; `MultiSelect` searches a
  long or growing list and keeps a chosen value that is no longer offered. Both take `options`, `value` and
  `onValueChange` from the app and give the value back in the order of the options. `ToggleChip` is one on/off chip.
- Pin the exact version: every change of the look is a pull request in the app, through its own tests.

## Calling the server

`createApi<paths>()` is an [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) client typed by the `paths` that
openapi-typescript generates from the app's contract, whose paths already start with `/api`, on the page's own origin
(`baseUrl` for another server; every option
of openapi-fetch's `createClient` passes through, so a header or a middleware is set there). `dataOf(call)` gives the data of
a call, `undefined` for 204, or throws `ApiError` for any status that is not 2xx: its `status`, the ProblemDetails body as
`problem` (the app reads its own extensions from it), and a message from `detail`, else the messages of a validation
problem's `errors`, else `title`, else the status line.

```ts
import { ApiError, createApi, dataOf } from "@maniumek/suwfrontkit";

import type { paths } from "./openapi";

export const api = createApi<paths>();

export const companyOf = (ticker: string, signal: AbortSignal) =>
    dataOf(api.GET("/api/companies/{ticker}", { params: { path: { ticker } }, signal }));

export const isMissing = (error: unknown) => error instanceof ApiError && error.status === 404;
```

A function like `companyOf` is what a TanStack Query `queryFn` or a form action calls: it takes the query's `signal`, throws a
real `Error` for the error boundary or the refusal, and needs no `!` on its data.

- The client resolves the contract's paths against the page's address and calls the page's `fetch` at the moment of each call,
  so a component that calls the server works in a jsdom unit test, and `vi.stubGlobal("fetch", …)` reaches it even after the
  client was made.
- An app's own ProblemDetails extensions are read from `problem`, typed by the app once, for example
  `const mistakesOf = (error: ApiError) => (Array.isArray(error.problem["mistakes"]) ? (error.problem["mistakes"] as Mistake[]) : [])`.
- Moving an app over: delete its own hand-written client; each `request<T>("/notes/1")` becomes
  `dataOf(api.GET("/api/notes/{id}", { params: { path: { id } } }))` (a body goes as `body`, unserialized; the query as
  `params.query`), and `new ApiError(message)` in tests becomes `new ApiError(status, { detail: message })`.
- With TanStack Query, do not retry a refusal: `retry: (failures, error) => !(error instanceof ApiError && error.status < 500) && failures < 2`
  shows a 404 at once instead of after three retries (suwagcms holds this setting until a second app needs it in the kit).

## Leaving unsaved changes

`useLeaveGuard(dirty)` in a form with unsaved changes makes the browser ask before the tab is closed or reloaded, and makes
`mayLeave()` ask "Discard the changes you have not saved?" (or the question passed as the second argument) before the app
navigates: the app calls it in its links, Back and Cancel, and goes on only when it returns `true`. `useLeaveGuardActive()`
tells any component whether a guard is on, for example to disable "Change id" until the form is saved. The guard knows no
router; one form at a time holds it.

## Texts and dates

Every text a component shows on its own (a heading of a list, an empty state, "Previous", "Next") is English by default
and comes from a `labels` prop that takes any of them, so an app in another language passes its words once:

```tsx
<History
    entries={entries}
    locale="pl-PL"
    labels={{ list: "Historia", empty: "Brak zmian.", details: "Szczegóły", previous: "Wstecz", next: "Dalej" }}
/>
```

Dates are formatted with `Intl.DateTimeFormat` in the `locale` and `timeZone` the app passes (the browser's when it
passes none). The library holds no translations and no date library.

## History

`History` lists changes newest first as the app orders them: when (`at`, a `Date` or an ISO string), who, what happened
(any node, such as a `Badge` and a sentence), and optionally `details` folded under a `<details>` and `actions` (for
example a button that shows a `Diff`). It fetches nothing.

- The whole list given: it pages through it by itself, `pageSize` entries a page (20 by default).
- One page from the server: pass that page's `entries` with `total` (all entries), or with `hasNext` when the total is
  unknown, and `page` with `onPageChange`; `loading` and `failure` show in place of the entries.
- `page` with `onPageChange` makes the paging controlled; without them it keeps the page itself. When everything fits on
  one page, no paging is drawn. With no entries it says so (`labels.empty`).

## Diff

`<Diff before={old} after={new} />` shows the lines removed and added between two texts, unified (`view="unified"`, the
default) or side by side (`view="split"`), with long unchanged runs folded to `context` lines around each change (3 by
default; `Infinity` folds nothing). Lines are compared with [jsdiff](https://github.com/kpdecker/jsdiff), ignoring a
missing newline at the end and Windows line endings.

## Workflow diagram

`FlowDiagram` draws nodes in rows and columns joined by arrows, on [React Flow](https://reactflow.dev) 13. React Flow is
heavy, so the diagram has its own entry point and React Flow is an optional peer: an app without a diagram installs
neither.

```sh
pnpm add --save-exact @xyflow/react
```

```css
@import "tailwindcss";
@import "@maniumek/suwfrontkit/theme.css";
@import "@maniumek/suwfrontkit/diagram.css";
```

```tsx
import { FlowDiagram, type DiagramEdge, type DiagramNode } from "@maniumek/suwfrontkit/diagram";

const nodes: DiagramNode[] = [
    { id: "intake", name: "Collect documents", row: 0, column: 0, icon: "✋", details: <Badge variant="success">Done</Badge> },
    { id: "check", name: "Check arrears", row: 1, column: 0 },
];
const edges: DiagramEdge[] = [{ from: "intake", to: "check", label: "yes" }];

<FlowDiagram nodes={nodes} edges={edges} label="Diagram of the procedure" selectedId={step} onNodeClick={setStep} />;
```

- A node has a name, a place (`row`, `column`) and optionally an `icon`, `marks` beside the name, `details` on a second
  line (a state badge, a deadline) and `muted`. An edge of `kind: "data"` is dashed, with its label by the target.
- The diagram does not zoom or pan: it is drawn at scale 1 and its frame scrolls. `focusId` scrolls a node into view,
  again whenever `focusRequest` changes. With `onNodeClick` every node is a button.
- `diagram.css` brings React Flow's base styles and points its colours at the theme's tokens.
- `GraphicSplit` puts a page's data on the left and a graphic, such as the diagram, on the right, held in view while the
  data scrolls.

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

[docs/development.md](docs/development.md): requirements, commands, working next to an app with `link:`. The quality gate is
[suwgate](https://github.com/Manomenu/suwgate) (`pnpm exec suwgate check`, configured in `suwgate.yml`).
Rules for changing the library: [AGENTS.md](AGENTS.md). How it is built: [docs/architecture.md](docs/architecture.md).

## Release

Changesets and npm trusted publishing from GitHub Actions (`.github/workflows/ci.yml`, which calls suwgate's reusable gate
and release workflows and keeps the publish job): merge the "Version Packages" pull request that CI keeps open, and CI
publishes with provenance.

The first version is published by hand, once, because npm configures a trusted publisher on a package that exists:

1. Create the public GitHub repository Manomenu/suwfrontkit and push `master`. In its Settings, Actions, General, allow
   GitHub Actions to create and approve pull requests.
2. On this machine, logged in to npm as `maniumek` with two-factor authentication: `npm login`, then
   `pnpm publish --access public`. This publishes the version in `package.json` (`prepack` builds `dist/` first).
3. On npmjs.com, the package's Settings, Trusted Publisher, GitHub Actions: organization or user `Manomenu`, repository
   `suwfrontkit`, workflow filename `ci.yml`, no environment, and allow `npm publish` (new configurations allow only
   staged publishing until it is ticked).
4. Within two days (an unused configuration expires): merge the "Version Packages" pull request that CI opened from the
   waiting changeset. CI publishes 0.1.0 through OIDC, with provenance.
5. Then, in the package's Settings, Publishing access: require two-factor authentication and disallow tokens.
