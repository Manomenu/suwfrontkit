---
"@maniumek/suwfrontkit": minor
---

React 19 actions and per-screen tab titles, with no prop removed:

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
