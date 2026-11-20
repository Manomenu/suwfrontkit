---
"@maniumek/suwfrontkit": patch
---

`createApi` resolves the contract's paths against the page's address itself and calls whatever `fetch` the page has at the
moment of the call. Components that call the server now work in a jsdom unit test (Node's `Request` refuses a relative URL)
and see a `fetch` the test stubs after the client was made. Nothing changes in the browser; a `Request` or `fetch` passed in
the options still wins.
