# TODO

Not built yet, in the order an app is likely to need it. Each arrives with the first app that needs it.

- Charts: a trend line with a legend, inspired by suwageval's charts folder (LineTrend, ChartLegend), without Mantine, as its own entry point like `/diagram`.
- Conversation view: a chat transcript, inspired by suwageval's `ConversationItems`.
- Layout primitives that the rewrite of suwageval from Mantine needs (Stack, Group, Text).
- Navigation panel extras: animation, icons with tooltips in the collapsed strip, a keyboard shortcut.
- Labels of Paginated and InfoTip ("Previous", "Next", "About …") as props, when an app is not in English.
- Icons (lucide), toasts, tabs; a published Storybook.
- A light theme, only if an app asks for one: a new layer over the same semantic token names.
- A typed API client: a small fetch wrapper over the types generated from an app's OpenAPI contract (today every app has its own src/api/client.ts), so every web calls its server the same way. Build it with the move of suwstockdrill onto the kit.
