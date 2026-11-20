---
"@maniumek/suwfrontkit": minor
---

A typed API client and a leave guard, taken from the apps' own copies; nothing is removed or renamed.

- `createApi<paths>(options?)`: an openapi-fetch client typed by the `paths` of the app's contract, on the page's own origin (the contract's paths carry `/api`);
  `dataOf(call)` gives a call's data (`undefined` for 204) or throws `ApiError`, which carries `status`, the ProblemDetails
  body as `problem`, and a message from `detail`, a validation problem's `errors`, `title` or the status line. openapi-fetch
  comes as a dependency of the kit.
- `useLeaveGuard(dirty, question?)`, `mayLeave()` and `useLeaveGuardActive()`: ask before the page or the screen is left with
  unsaved changes (the browser's own prompt on close and reload, `window.confirm` before in-app navigation).

Migration: an app may delete its own `src/api/client.ts` and `leaveGuard.ts` and import these instead; with its paths generated
by openapi-typescript, `request<T>("/companies/ASML")` (on `/api`) becomes
`dataOf(api.GET("/api/companies/{ticker}", { params: { path: { ticker: "ASML" } } }))`.
