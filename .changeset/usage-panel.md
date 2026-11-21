---
"@maniumek/suwfrontkit": minor
---

`UsagePanel`: the "Used by" / "Uses" cards of a resource's edit screen, which alfusion and suwagcms each had as a copy. It takes
the app's own entries (`usage: { usedBy, uses } | null`, `null` while loading) and `linkOf(entry) => { href, label, detail? }`,
shows a `Spinner` while loading, the `failure` as an `Alert`, an empty card's sentence, links that move with the router under a
`LinkProvider`, `showUses={false}` for a kind that can refer to nothing, and `labels` for other texts. An app deletes its
`usagePanel.tsx` and passes `linkOf` where it passed `hrefOf`.
