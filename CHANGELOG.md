# @maniumek/suwfrontkit

## 0.4.0

### Minor Changes

- 0569d74: React 19 actions and per-screen tab titles, with no prop removed:
  
  - `ResourceEdit` takes `action`, a React form action (`(formData: FormData) => void | Promise<void>`, sync or async, the
    dispatcher of `useActionState` included). Save reads `useFormStatus`: while the action runs it shows `pendingLabel`
    ("Saving…" by default), is disabled and busy, and a second submit is ignored. The fields can be uncontrolled (`name` with
    `defaultValue`); React resets them to their `defaultValue` after a successful save and sends an error the action throws
    to the nearest error boundary.
  - `ConfirmDialog` runs a confirmation that returns a promise as a transition (`useTransition`). It looks and behaves as
    before: a busy confirm button, Cancel and Escape disabled until it settles, closed when it resolves, open when it rejects.
  - `Page` renders its `title` as the document's `<title>` too, so the browser tab names the screen (ResourceList and
    ResourceEdit get it through Page). The new `AppTitle` context adds the app's name: `<AppTitle value="myapp">` around the
    app gives `Companies · myapp`.
  
  Migration: nothing breaks. `onSubmit` with `saving` keeps working the old way (controlled fields, `saving` set by the app,
  Save disabled while it is true). Prefer `action` in new and touched screens: pass the action instead of `onSubmit`, give
  each field a `name` and a `defaultValue` instead of `value` and `onChange`, and drop the `saving` state. A screen takes one of
  the two; passing `action` together with `onSubmit` or `saving` is a type error. An app whose `index.html` sets a `<title>`
  keeps it as the title of screens without a `Page`.

## 0.3.0

### Minor Changes

- 599098b: A clearer look in three places, with no change of props:
  
  - The current item of the navigation panel has a mauve bar on its left and a `surface1` background (the `accent` token), in
    the expanded panel and in the collapsed strip, instead of the faint `primary-light` tint.
  - Dialog and ConfirmDialog dim the page behind them with the new `backdrop` token (crust at 80%) instead of `background` at
    70%, which hardly showed on a page of the same colour.
  - The destructive Button, and with it the confirm button of a destructive ConfirmDialog and the delete button of
    ResourceEdit, is red (`destructive` with the new `destructive-foreground`, `destructive-hover` on hover) instead of dark
    maroon (`destructive-light`). Alert, Badge and Diff keep their `destructive-light` tints.
  
  New tokens: `--backdrop`, `--destructive-foreground`, `--destructive-hover` (and their `--color-*` utilities). No token is
  removed or renamed. An app that records screenshots of these components records them again.

## 0.2.0

### Minor Changes

- 096cb42: AppShell and NavLink require icons: the header shows the app's icon and title as a link home, and the collapsed panel is a strip of the navigation icons with their names in tooltips.
  
  **Breaking.** What an app changes:
  
  - `AppShell`: `header` is removed. Pass `appIcon` (a React element: an inline SVG, an `<img>`, an icon from lucide-react), `appTitle` (the app's name) and `home`, a render prop that draws the link to the start page with the app's router: `home={(link) => <Link href="/" {...link} />}`, or `home={(link) => <a href="/" {...link} />}` without one. Anything else that was in the header goes to the optional `headerEnd`, on the right.
  - `NavLink`: `icon` and `label` are required, and the text no longer goes in the children. `<NavLink href="/" current>Companies</NavLink>` becomes `<NavLink href="/" icon={<Building2 />} label="Companies" current />`; with `asChild` the router's link stays the child, empty: `<NavLink asChild icon={<Building2 />} label="Companies" current><Link href="/" /></NavLink>`.
  - The collapsed panel no longer removes the navigation: it shows the icons, each named by its label (`aria-label`) with `aria-current` kept. A test that expected the navigation to vanish after collapsing finds the links by their labels instead.
- 5b582e7: Components to choose and filter: `ToggleChip` (one on/off chip, `aria-pressed`, controlled by `pressed` and `onPressedChange`), `ChipFilter` (a short fixed list of options as toggle chips, with a count of the chosen ones and a clear button) and `MultiSelect` (a combobox that searches the options and chooses several, with full keyboard support, removable chips and a clear button; it takes `id`, `aria-invalid` and `aria-describedby` from `Field`). Both lists take `options`, `value` and `onValueChange` and give the value back in the order of the options; every text they show is a prop with an English default.
- 8b865bd: Feedback blocks:
  
  - `Dialog`: a modal dialog on Radix Dialog (focus trap, Escape, focus back to what opened it, named by its `title`, described by its `description`), controlled with `open` and `onOpenChange`, its body in `children` and its buttons in `actions`.
  - `ConfirmDialog`: asks before an action on Radix Alert Dialog; starts on Cancel, `variant="destructive"` for an action that destroys, labels as props (`confirmLabel`, `cancelLabel`, `pendingLabel`). When `onConfirm` returns a promise it waits: the confirm button is busy, Cancel and Escape do nothing, and the dialog closes when the promise resolves or stays open when it rejects.
  - `ErrorBoundary`: catches a render error below it and shows `ErrorScreen` with a "Try again" that resets it, or the app's own `fallback({ error, retry })`; `onError(error, info)` reports it. A new `key` (for example the route) resets it too.
  - `ErrorScreen`: what failed and a button to try again, labels as props (`title`, `retryLabel`).
  - `StatusBadge`: the state of something as a Badge with a dot, `status` one of success, warning, danger, info, neutral and pending (in the info colours, its dot pulses).
  - Formatting on Intl, with a dash for nothing: `formatDateTime` ("2026-11-18 04:41", the computer's own time zone), `formatDate`, `formatTime`, `formatPercent` ("66.7%") and `formatSeconds` (milliseconds as "9.8 s").
- 283677b: ResourceList and ResourceEdit, the list and the edit screen of a resource, built from Page, Table, Paginated, Paper,
  StickyActions, Alert, Anchor, Button and ConfirmDialog. Rows open and Add leads through the app's own links (render
  props), so no router is needed. ResourceEdit draws the form's footer (refusal with its mistakes, Save, Cancel) in
  StickyActions, and Delete asks first in a ConfirmDialog; an `onDelete` that returns a promise keeps the dialog busy
  until it settles.
- 157019f: Three larger blocks:
  
  - `FlowDiagram`, a workflow diagram on React Flow 13 (nodes in rows and columns, flow and data edges with labels, a selected node, a node scrolled into view, no zoom or pan), under its own entry point `@maniumek/suwfrontkit/diagram` with `@maniumek/suwfrontkit/diagram.css`. `@xyflow/react` is an optional peer dependency: an app without a diagram installs nothing new. With it, `GraphicSplit` puts a page's data on the left and a graphic on the right.
  - `History`, a list of changes (when, who, what, folded details, actions such as "show the diff") with an empty state, dates formatted with `Intl` in the app's locale and time zone, and paging through `Paginated`: by itself over a whole list, or one page from the server with a total or a `hasNext` flag, controlled or not.
  - `Diff`, the lines removed and added between two texts, unified or side by side, with long unchanged runs folded; lines are compared with jsdiff (`diff`, now a dependency).
  
  `Paginated` takes `labels` (Previous, Next, the page line, Loading…) and a `hasNext` flag on `Paging` for a list whose total is unknown. Texts of the new components are English by default and every one is a `labels` prop.

## 0.1.1

### Patch Changes

- ec8cb1b: The package is now @maniumek/suwfrontkit; @maniumek/suwfrontstyle is deprecated. The same code under a new name: an app moves over with `pnpm remove @maniumek/suwfrontstyle && pnpm add --save-exact @maniumek/suwfrontkit` and imports `@maniumek/suwfrontkit/theme.css` and `@maniumek/suwfrontkit`.

## 0.1.0

### Minor Changes

- ba4dd1d: First release: Catppuccin Mocha tokens and Tailwind 4 theme (theme.css), Inter Variable loaded from the package, and the components Button, Badge, Alert, Input, Textarea, Select, Label, Field, Legend, InfoTip, Table, Paper, Panel, Page, StickyActions, Paginated, Anchor, AppShell and NavLink.
