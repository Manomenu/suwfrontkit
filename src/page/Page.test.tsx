import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { AppTitle } from "./appTitle.js";
import { Page } from "./Page.js";

it("fills the width by default, with the title, what stands beside it and the actions", () => {
    render(<Page title="Companies" titleAside={<span>3 new</span>} actions={<button type="button">Add</button>} />);

    const title = screen.getByRole("heading", { name: "Companies", level: 1 });
    expect(title.nextSibling?.textContent).toBe("3 new");
    expect(screen.getByRole("button", { name: "Add" })).toBeDefined();
    expect(title.closest("[data-width]")?.className).not.toContain("max-w-reading");
});

it("keeps text at a readable width when asked", () => {
    render(<Page title="Thesis" width="reading" />);

    expect(screen.getByRole("heading", { name: "Thesis" }).closest("[data-width]")?.className).toContain("max-w-reading");
});

it("names the browser tab after the screen, ahead of the title index.html sets, and adds the app's title when given", () => {
    document.head.innerHTML = "<title>myapp</title>";
    const { rerender, unmount } = render(<Page title="Companies" />);
    expect(document.title).toBe("Companies");

    rerender(
        <AppTitle value="myapp">
            <Page title="Company ASML" />
        </AppTitle>,
    );
    expect(document.title).toBe("Company ASML · myapp");

    unmount();
    expect(document.title).toBe("myapp");
});
