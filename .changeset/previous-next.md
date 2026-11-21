---
"@maniumek/suwfrontkit": minor
---

`PreviousNext`: the Previous / counter / Next bar of `Paginated`, as a component of its own, for any walk through a list. Its
counter sits in a slot of a fixed width with tabular figures, so a counter text that changes length ("1 of 1", "12 current
steps") never moves the buttons. `previousDisabled`, `nextDisabled`, an optional `reason` (shown beside disabled buttons and
read as their description), `size` `sm` or `xs`. `Paginated` draws its bar with it: the page counter is muted and its buttons
sit 0.5rem from it (was 0.75rem). Nothing is removed.

`NavTree`: nested navigation in the AppShell's panel, at most three levels, typed (`NavItem1`, `NavItem2`, `NavItem3`), so a
fourth level is a compile error. Expanded: each level indented by about 12 px behind a guide line, 16 px icons below the first
level, the panel's width unchanged, long labels truncated with the full text on hover; the active item highlighted with
`aria-current="page"`, its ancestors lightly marked. Collapsed: every first-level icon, and under the one holding the active page
only the active path, in one tinted rail. An app deletes its hand-made nested lists and passes its tree. `NavLink` (and so the
tree) moves with the app's router under a `LinkProvider`.
