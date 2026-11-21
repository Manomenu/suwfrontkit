---
"@maniumek/suwfrontkit": minor
---

Fewer components, each with one job, and the few general props that let the apps delete their near-copies. Breaking: three
exports and three render props are gone.

Removed, and what an app writes instead:

- `ChipFilter`: `MultiSelect` inside `Field` (or `Label`) for a visible label.
- `StatusBadge`: `<Badge variant="success" dot>`; the `pending` status is `<Badge variant="info" dot="pulsing">`. The `Status`
  type is gone with it.
- `Panel`: `<Paper title="History">`, the same region named by its `h2`.
- `ResourceList`'s `link` and `add` render props: `hrefOf={(row) => …}` and `addHref`. `ResourceEdit`'s `back`: `backHref`.
  The links are `GuardedLink`s that move with the app's router under a `LinkProvider`.
- `GuardedLink`'s `navigate` prop: wrap the app once in `<LinkProvider navigate={navigate}>` (wouter's `useLocation()[1]`); an
  app wrapper that bound `navigate` (such as an `AppLink`) is deleted.
- `ResourceEdit`'s `mistakes` are the refusal's `Mistake`s (`error.mistakes`), no longer strings.

Added:

- `LinkProvider`: the app's `navigate`, once, at the root. Under it `Anchor`, `GuardedLink`, `ResourceList` and `ResourceEdit`
  ask `mayLeave()` and move with the router on a plain click on a path of the app; without it they stay plain links, so an app
  without a router needs none.
- `MistakeList`: the mistakes of a refusal, each with `at`, message and fix. `blockedByUsage(usedBy)`: the sentence that blocks a
  deletion while something uses the resource.
- `DiffLines`: draws lines a server already compared (`same`, `added`, `removed`, `folded`) in the look of `Diff`.
- `Badge` `dot`, `Paper` `title`, `ErrorScreen` `actions` (in place of the retry, for an app's own fallback), `InfoTip` `help` as
  any node with `onOpenChange`, `ToggleChip` `help` (a tooltip), `Dialog` `closable` with `closeLabel`, and
  `refusalReader<Code, MistakeCode>()` for mistakes with codes of their own.

Changed look:

- `Spinner` shows its `label` as text beside the ring; Paginated, ResourceList and ResourceEdit load with it instead of a line of
  text. A test that found `Loading…` by its text still does; `getByRole("status", { name })` finds it too.
- The body of `Dialog` and `ConfirmDialog` scrolls on its own between the title and the actions (`data-slot="dialog-body"`).
