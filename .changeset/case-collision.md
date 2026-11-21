---
"@maniumek/suwfrontkit": patch
---

Fix 0.11.0 for the Vite dev server: `dist/appShell/NavTree.js` imported `./navTree.js`, a file whose name differed only in case,
and esbuild's pre-bundling took one for the other ("No matching export … holdsCurrent"). The types module is now `navItems.js`;
nothing exported changes. A guard of the library now refuses two files whose built names differ only in case.
