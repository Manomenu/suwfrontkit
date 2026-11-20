---
"@maniumek/suwfrontkit": minor
---

A clearer look in three places, with no change of props:

- The current item of the navigation panel has a mauve bar on its left and a `surface1` background (the `accent` token), in
  the expanded panel and in the collapsed strip, instead of the faint `primary-light` tint.
- Dialog and ConfirmDialog dim the page behind them with the new `backdrop` token (crust at 80%) instead of `background` at
  70%, which hardly showed on a page of the same colour.
- The destructive Button, and with it the confirm button of a destructive ConfirmDialog and the delete button of
  ResourceEdit, is red (`destructive` with the new `destructive-foreground`, `destructive-hover` on hover) instead of dark
  maroon (`destructive-light`). Alert, Badge and Diff keep their `destructive-light` tints.

New tokens: `--backdrop`, `--destructive-foreground`, `--destructive-hover` (and their `--color-*` utilities). No token is
removed or renamed. An app that records screenshots of these components records them again.
