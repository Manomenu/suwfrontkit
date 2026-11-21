---
"@maniumek/suwfrontkit": minor
---

`PreviousNext`: the Previous / counter / Next bar of `Paginated`, as a component of its own, for any walk through a list. Its
counter sits in a slot of a fixed width with tabular figures, so a counter text that changes length ("1 of 1", "12 current
steps") never moves the buttons. `previousDisabled`, `nextDisabled`, an optional `reason` (shown beside disabled buttons and
read as their description), `size` `sm` or `xs`. `Paginated` draws its bar with it: the page counter is muted and its buttons
sit 0.5rem from it (was 0.75rem). Nothing is removed.
