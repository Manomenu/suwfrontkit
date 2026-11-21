---
"@maniumek/suwfrontkit": minor
---

`PreviousNext` takes `widestCounter`, the widest text its counter can show, and reserves exactly that width in place of
the fixed 16ch slot, so a short counter ("1/1") no longer leaves a wide gap between the buttons, and a changing counter
still never moves them. `Paginated` passes its last page ("Page 12 of 12"). An app whose counter changes width (other
than `Paginated`) passes `widestCounter`; without it the counter takes its own width and the Next button moves with it.
