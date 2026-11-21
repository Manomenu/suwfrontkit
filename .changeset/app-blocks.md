---
"@maniumek/suwfrontkit": minor
---

Three building blocks the apps each carried a copy of; nothing is removed or renamed.

- `createQueryClient()` from the new entry point `@maniumek/suwfrontkit/query`: a TanStack Query v5 client that retries with
  `retryUnlessRefused` and never refetches on window focus or reconnect. `@tanstack/react-query` (^5) is an optional peer. An app
  deletes its own `src/api/queryClient.ts` and imports this one; tests that only checked those defaults move to the kit.
- `GuardedLink`: a real `<a href>` that asks `mayLeave()` before it calls the app's `navigate`; Ctrl, Cmd, Shift, Alt and middle
  clicks, `target` and `download` stay the browser's. Return it from the `link`, `add` and `back` props of `ResourceList` and
  `ResourceEdit` in place of a `<button>` that called `mayLeave()` and navigated.
- `readServerSentEvents<Events>(body)`: a typed reader of a server-sent-event stream, for the answer of a POST, yielding
  `{ name, data }` with the data read as JSON.
