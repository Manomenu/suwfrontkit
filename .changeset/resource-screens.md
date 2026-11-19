---
"@maniumek/suwfrontstyle": minor
---

ResourceList and ResourceEdit, the list and the edit screen of a resource, built from Page, Table, Paginated, Paper,
StickyActions, Alert, Anchor and Button. Rows open and Add leads through the app's own links (render props), so no
router is needed. ResourceEdit draws the form's footer (refusal with its mistakes, Save, Cancel) in StickyActions, and
Delete asks first through the confirmation the app passes in `deletion.confirm`.
