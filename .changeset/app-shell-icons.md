---
"@maniumek/suwfrontstyle": minor
---

AppShell and NavLink require icons: the header shows the app's icon and title as a link home, and the collapsed panel is a strip of the navigation icons with their names in tooltips.

**Breaking.** What an app changes:

- `AppShell`: `header` is removed. Pass `appIcon` (a React element: an inline SVG, an `<img>`, an icon from lucide-react), `appTitle` (the app's name) and `home`, a render prop that draws the link to the start page with the app's router: `home={(link) => <Link href="/" {...link} />}`, or `home={(link) => <a href="/" {...link} />}` without one. Anything else that was in the header goes to the optional `headerEnd`, on the right.
- `NavLink`: `icon` and `label` are required, and the text no longer goes in the children. `<NavLink href="/" current>Companies</NavLink>` becomes `<NavLink href="/" icon={<Building2 />} label="Companies" current />`; with `asChild` the router's link stays the child, empty: `<NavLink asChild icon={<Building2 />} label="Companies" current><Link href="/" /></NavLink>`.
- The collapsed panel no longer removes the navigation: it shows the icons, each named by its label (`aria-label`) with `aria-current` kept. A test that expected the navigation to vanish after collapsing finds the links by their labels instead.
