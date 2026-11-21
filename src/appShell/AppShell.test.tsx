import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, expect, it } from "vitest";

import { AppShell } from "./AppShell.js";
import { NavLink } from "./NavLink.js";
import type { NavItem1 } from "./navTree.js";
import { NavTree } from "./NavTree.js";

const KEY = "test.navigation-panel";

const icon = <svg data-testid="icon" />;

function shell(side?: "left" | "right") {
    return (
        <AppShell
            appIcon={icon}
            appTitle="myapp"
            home={(link) => <a href="/" {...link} />}
            headerEnd={<span>signed in</span>}
            panel={
                <nav aria-label="Main">
                    <NavLink href="/a" icon={icon} label="Companies" current />
                    <NavLink asChild icon={icon} label="Theses" current={false}>
                        <a href="/b" />
                    </NavLink>
                </nav>
            }
            panelLabel="Navigation panel"
            storageKey={KEY}
            {...(side === undefined ? {} : { side })}
        >
            <p>content</p>
        </AppShell>
    );
}

const toggle = () => screen.getByRole("button", { name: "Navigation panel" });
const navigation = () => within(screen.getByRole("navigation", { name: "Main" }));

beforeEach(() => {
    window.localStorage.clear();
});

it("starts expanded when nothing is remembered, whatever the window width", () => {
    window.innerWidth = 800;
    render(shell());

    expect(toggle().getAttribute("aria-expanded")).toBe("true");
    expect(navigation().getByText("Companies")).toBeDefined();
    expect(screen.getByRole("main").textContent).toBe("content");
});

it("draws the app's icon and title as a link home, and the rest of the header after them", () => {
    render(shell());

    const header = within(screen.getByRole("banner"));
    const home = header.getByRole("link", { name: "myapp" });
    expect(home.getAttribute("href")).toBe("/");
    expect(within(home).getByTestId("icon").parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(header.getByText("signed in")).toBeDefined();
});

it("collapses to the strip of icons, remembers it under the app's key, and starts collapsed next time", () => {
    const { unmount } = render(shell());

    fireEvent.click(toggle());

    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    expect(navigation().getAllByRole("link")).toHaveLength(2);
    expect(navigation().getAllByTestId("icon")).toHaveLength(2);
    expect(navigation().queryByText("Companies")).toBeNull();
    expect(document.getElementById("navigation-panel")?.style.width).toBe("48px");
    expect(window.localStorage.getItem(KEY)).toBe("collapsed");

    unmount();
    render(shell());
    expect(toggle().getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(toggle());
    expect(window.localStorage.getItem(KEY)).toBe("expanded");
    expect(document.getElementById("navigation-panel")?.style.width).toBe("220px");
});

it("names each link by its label in both states, with aria-label only while the text is hidden", () => {
    render(shell());

    expect(screen.getByRole("link", { name: "Theses" }).hasAttribute("aria-label")).toBe(false);
    fireEvent.click(toggle());
    expect(screen.getByRole("link", { name: "Companies" }).getAttribute("aria-label")).toBe("Companies");
    expect(screen.getByRole("link", { name: "Theses" }).getAttribute("href")).toBe("/b");
});

it("marks the current page in the navigation, expanded and collapsed", () => {
    render(shell());

    for (let round = 0; round < 2; round++) {
        expect(screen.getByRole("link", { name: "Companies" }).getAttribute("aria-current")).toBe("page");
        expect(screen.getByRole("link", { name: "Theses" }).hasAttribute("aria-current")).toBe(false);
        fireEvent.click(toggle());
    }
});

it("the toggle controls the panel, and the panel can stand on the right", () => {
    render(shell("right"));

    expect(toggle().getAttribute("aria-controls")).toBe("navigation-panel");
    expect(document.getElementById("navigation-panel")?.parentElement?.className).toContain("flex-row-reverse");
});

it("refuses, at compile time, a shell without the app's icon or title and a link without its icon", () => {
    const home = (link: { className: string; children: ReactNode }) => <a href="/" {...link} />;
    const refused = [
        // @ts-expect-error the app's icon is required
        <AppShell key="no-icon" appTitle="myapp" home={home} panel={null} panelLabel="Panel" storageKey={KEY}>
            content
        </AppShell>,
        // @ts-expect-error the app's title is required
        <AppShell key="no-title" appIcon={icon} home={home} panel={null} panelLabel="Panel" storageKey={KEY}>
            content
        </AppShell>,
        // @ts-expect-error a navigation link's icon is required
        <NavLink key="no-link-icon" href="/a" label="Companies" current />,
        // @ts-expect-error a navigation link's icon cannot be left empty
        <NavLink key="empty-link-icon" href="/a" icon={null} label="Companies" current />,
    ];
    expect(refused).toHaveLength(4);
});

function tree(active: "bot" | "facts" | "projects"): NavItem1[] {
    return [
        {
            icon,
            label: "Bots",
            href: "/bots",
            current: false,
            items: [
                {
                    icon,
                    label: "shop",
                    href: "/bots/shop",
                    current: active === "bot",
                    items: [
                        { icon, label: "Facts", href: "/bots/shop/facts", current: active === "facts" },
                        { icon, label: "Articles", href: "/bots/shop/articles", current: false },
                    ],
                },
                {
                    icon,
                    label: "bank",
                    href: "/bots/bank",
                    current: false,
                    items: [{ icon, label: "Facts", href: "/bots/bank/facts", current: false }],
                },
            ],
        },
        {
            icon,
            label: "Projects",
            href: "/projects",
            current: active === "projects",
            items: [{ icon, label: "test-3", href: "/projects/3", current: false }],
        },
    ];
}

function nested(active: "bot" | "facts" | "projects") {
    return (
        <AppShell
            appIcon={icon}
            appTitle="myapp"
            home={(link) => <a href="/" {...link} />}
            panel={
                <nav aria-label="Main">
                    <NavTree items={tree(active)} />
                </nav>
            }
            panelLabel="Navigation panel"
            storageKey={KEY}
        >
            <p>content</p>
        </AppShell>
    );
}

const names = () =>
    navigation()
        .getAllByRole("link")
        .map((link) => link.getAttribute("aria-label") ?? link.textContent);

it("puts aria-current on the active link only, at any level, and marks its ancestors as holding it", () => {
    render(nested("facts"));

    const current = navigation()
        .getAllByRole("link")
        .filter((link) => link.hasAttribute("aria-current"));
    expect(current.map((link) => [link.textContent, link.getAttribute("aria-current")])).toEqual([["Facts", "page"]]);
    expect(current[0]?.getAttribute("href")).toBe("/bots/shop/facts");
    expect(navigation().getByRole("link", { name: "Bots" }).hasAttribute("data-holds-current")).toBe(true);
    expect(navigation().getByRole("link", { name: "shop" }).hasAttribute("data-holds-current")).toBe(true);
    expect(navigation().getByRole("link", { name: "bank" }).hasAttribute("data-holds-current")).toBe(false);
});

it("expanded, shows every level, each nested list indented behind its guide line", () => {
    render(nested("facts"));

    expect(names()).toEqual(["Bots", "shop", "Facts", "Articles", "bank", "Facts", "Projects", "test-3"]);
    expect(navigation().getByRole("link", { name: "shop" }).closest("ul")?.className).toContain("border-l");
    expect(navigation().getByText("shop").getAttribute("title")).toBe("shop");
});

it.each([
    ["facts", ["Bots", "shop", "Facts", "Projects"]],
    ["bot", ["Bots", "shop", "Projects"]],
    ["projects", ["Bots", "Projects"]],
] as const)("collapsed with %s active, shows the level-1 icons and only the active path, inside one rail", (active, shown) => {
    window.localStorage.setItem(KEY, "collapsed");
    render(nested(active));

    expect(names()).toEqual(shown);
    const rail = navigation()
        .queryAllByRole("listitem")
        .filter((item) => item.dataset["slot"] === "nav-rail");
    expect(rail.length).toBe(active === "projects" ? 0 : 1);
    expect(
        navigation()
            .getAllByRole("link")
            .filter((link) => link.hasAttribute("aria-current")).length,
    ).toBe(1);
});

it("refuses, at compile time, a fourth level", () => {
    const third: NavItem1 = {
        icon,
        label: "Bots",
        href: "/bots",
        current: false,
        items: [
            {
                icon,
                label: "shop",
                href: "/bots/shop",
                current: false,
                items: [
                    {
                        icon,
                        label: "Facts",
                        href: "/bots/shop/facts",
                        current: false,
                        // @ts-expect-error the panel has three levels at most
                        items: [{ icon, label: "Rules", href: "/bots/shop/facts/rules", current: true }],
                    },
                ],
            },
        ],
    };

    expect(third.items?.length).toBe(1);
});
