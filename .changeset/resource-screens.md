---
"@maniumek/suwfrontkit": minor
---

ResourceList and ResourceEdit, the list and the edit screen of a resource, built from Page, Table, Paginated, Paper,
StickyActions, Alert, Anchor, Button and ConfirmDialog. Rows open and Add leads through the app's own links (render
props), so no router is needed. ResourceEdit draws the form's footer (refusal with its mistakes, Save, Cancel) in
StickyActions, and Delete asks first in a ConfirmDialog; an `onDelete` that returns a promise keeps the dialog busy
until it settles.
