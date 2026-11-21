---
"@maniumek/suwfrontkit": minor
---

`ApiError` reads the shared refusal format of suwbackkit servers: `error.code` (`string | null`) and `error.mistakes` (each with
`code`, `message`, `fix`, `at` when given, and the app's own members), plus `refusalReader<Code>()`, whose `codeOf(error)` and
`mistakesOf(error)` read any caught value, typed by the app's enum of codes. An answer that is not a refusal reads as no code and no mistakes; a
mistake without its fix is left out. An app deletes its own `codeOf` and `mistakesOf` helpers that dug into `problem`; nothing is
removed or renamed.
