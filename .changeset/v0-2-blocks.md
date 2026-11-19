---
"@maniumek/suwfrontstyle": minor
---

Three larger blocks:

- `FlowDiagram`, a workflow diagram on React Flow 13 (nodes in rows and columns, flow and data edges with labels, a selected node, a node scrolled into view, no zoom or pan), under its own entry point `@maniumek/suwfrontstyle/diagram` with `@maniumek/suwfrontstyle/diagram.css`. `@xyflow/react` is an optional peer dependency: an app without a diagram installs nothing new. With it, `GraphicSplit` puts a page's data on the left and a graphic on the right.
- `History`, a list of changes (when, who, what, folded details, actions such as "show the diff") with an empty state, dates formatted with `Intl` in the app's locale and time zone, and paging through `Paginated`: by itself over a whole list, or one page from the server with a total or a `hasNext` flag, controlled or not.
- `Diff`, the lines removed and added between two texts, unified or side by side, with long unchanged runs folded; lines are compared with jsdiff (`diff`, now a dependency).

`Paginated` takes `labels` (Previous, Next, the page line, Loading…) and a `hasNext` flag on `Paging` for a list whose total is unknown. Texts of the new components are English by default and every one is a `labels` prop.
