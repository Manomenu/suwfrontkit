---
"@maniumek/suwfrontstyle": minor
---

Components to choose and filter: `ToggleChip` (one on/off chip, `aria-pressed`, controlled by `pressed` and `onPressedChange`), `ChipFilter` (a short fixed list of options as toggle chips, with a count of the chosen ones and a clear button) and `MultiSelect` (a combobox that searches the options and chooses several, with full keyboard support, removable chips and a clear button; it takes `id`, `aria-invalid` and `aria-describedby` from `Field`). Both lists take `options`, `value` and `onValueChange` and give the value back in the order of the options; every text they show is a prop with an English default.
