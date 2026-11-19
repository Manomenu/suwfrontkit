import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Button } from "./Button.js";

it("is a button that names its variant and size", () => {
    render(
        <Button variant="destructive" size="sm">
            Delete
        </Button>,
    );

    const button = screen.getByRole("button", { name: "Delete" });
    expect(button.dataset["variant"]).toBe("destructive");
    expect(button.dataset["size"]).toBe("sm");
    expect(button.className).toContain("bg-destructive-light");
});

it("as a child styles the element it wraps", () => {
    render(
        <Button asChild>
            <a href="/reports">Reports</a>
        </Button>,
    );

    expect(screen.getByRole("link", { name: "Reports" }).className).toContain("bg-primary");
});
