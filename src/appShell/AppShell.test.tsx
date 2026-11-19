import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";

import { AppShell } from "./AppShell.js";
import { NavLink } from "./NavLink.js";

const KEY = "test.navigation-panel";

function shell(side?: "left" | "right") {
    return (
        <AppShell
            header={<span>app</span>}
            panel={
                <nav aria-label="Main">
                    <NavLink href="/a" current>
                        Companies
                    </NavLink>
                    <NavLink href="/b" current={false}>
                        Theses
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

beforeEach(() => {
    window.localStorage.clear();
});

it("starts expanded when nothing is remembered, whatever the window width", () => {
    window.innerWidth = 800;
    render(shell());

    expect(toggle().getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("navigation", { name: "Main" })).toBeDefined();
    expect(screen.getByRole("main").textContent).toBe("content");
});

it("collapses to the narrow strip, remembers it under the app's key, and starts collapsed next time", () => {
    const { unmount } = render(shell());

    fireEvent.click(toggle());

    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("navigation", { name: "Main" })).toBeNull();
    expect(document.getElementById("navigation-panel")?.style.width).toBe("48px");
    expect(window.localStorage.getItem(KEY)).toBe("collapsed");

    unmount();
    render(shell());
    expect(toggle().getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(toggle());
    expect(window.localStorage.getItem(KEY)).toBe("expanded");
    expect(document.getElementById("navigation-panel")?.style.width).toBe("220px");
});

it("the toggle controls the panel, and the panel can stand on the right", () => {
    render(shell("right"));

    expect(toggle().getAttribute("aria-controls")).toBe("navigation-panel");
    expect(document.getElementById("navigation-panel")?.parentElement?.className).toContain("flex-row-reverse");
});

it("marks the current page in the navigation", () => {
    render(shell());

    expect(screen.getByRole("link", { name: "Companies" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Theses" }).hasAttribute("aria-current")).toBe(false);
});
