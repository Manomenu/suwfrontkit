import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

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
