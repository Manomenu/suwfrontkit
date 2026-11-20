---
"@maniumek/suwfrontkit": minor
---

`retryUnlessRefused(failures, error)`, the `retry` of a TanStack Query `QueryClient`: a 4xx `ApiError` (a refusal, such as a 404) is never
asked again, any other failure (a 5xx, the network) at most twice. Apps holding their own copy (suwagcms's `retriesOnlyWhatMayPass`) can
replace it; nothing else changes.
