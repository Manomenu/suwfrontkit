---
"@maniumek/suwfrontstyle": minor
---

Feedback blocks:

- `Dialog`: a modal dialog on Radix Dialog (focus trap, Escape, focus back to what opened it, named by its `title`, described by its `description`), controlled with `open` and `onOpenChange`, its body in `children` and its buttons in `actions`.
- `ConfirmDialog`: asks before an action on Radix Alert Dialog; starts on Cancel, `variant="destructive"` for an action that destroys, labels as props (`confirmLabel`, `cancelLabel`, `pendingLabel`). When `onConfirm` returns a promise it waits: the confirm button is busy, Cancel and Escape do nothing, and the dialog closes when the promise resolves or stays open when it rejects.
