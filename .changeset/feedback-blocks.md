---
"@maniumek/suwfrontkit": minor
---

Feedback blocks:

- `Dialog`: a modal dialog on Radix Dialog (focus trap, Escape, focus back to what opened it, named by its `title`, described by its `description`), controlled with `open` and `onOpenChange`, its body in `children` and its buttons in `actions`.
- `ConfirmDialog`: asks before an action on Radix Alert Dialog; starts on Cancel, `variant="destructive"` for an action that destroys, labels as props (`confirmLabel`, `cancelLabel`, `pendingLabel`). When `onConfirm` returns a promise it waits: the confirm button is busy, Cancel and Escape do nothing, and the dialog closes when the promise resolves or stays open when it rejects.
- `ErrorBoundary`: catches a render error below it and shows `ErrorScreen` with a "Try again" that resets it, or the app's own `fallback({ error, retry })`; `onError(error, info)` reports it. A new `key` (for example the route) resets it too.
- `ErrorScreen`: what failed and a button to try again, labels as props (`title`, `retryLabel`).
- `StatusBadge`: the state of something as a Badge with a dot, `status` one of success, warning, danger, info, neutral and pending (in the info colours, its dot pulses).
- Formatting on Intl, with a dash for nothing: `formatDateTime` ("2026-11-18 04:41", the computer's own time zone), `formatDate`, `formatTime`, `formatPercent` ("66.7%") and `formatSeconds` (milliseconds as "9.8 s").
