import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, expect, it } from "vitest";

import { AppShell } from "./AppShell.js";
import { NavLink } from "./NavLink.js";

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
