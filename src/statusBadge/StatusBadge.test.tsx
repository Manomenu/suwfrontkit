import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { StatusBadge, type Status } from "./StatusBadge.js";

it.each<[Status, string]>([
    ["success", "bg-success-light"],
    ["warning", "bg-warning-light"],
    ["danger", "bg-destructive-light"],
    ["info", "bg-info-light"],
    ["neutral", "bg-secondary"],
    ["pending", "bg-info-light"],
])("a %s status is a Badge in its colours, named by its text alone", (status, colour) => {
    render(<StatusBadge status={status}>Label</StatusBadge>);

    const badge = screen.getByText("Label");
    expect(badge.dataset["slot"]).toBe("badge");
    expect(badge.dataset["status"]).toBe(status);
    expect(badge.className).toContain(colour);
    expect(badge.textContent).toBe("Label");
});

it("only a pending status pulses, and only when motion is welcome", () => {
    render(
        <>
            <StatusBadge status="pending">Running</StatusBadge>
            <StatusBadge status="success">Passed</StatusBadge>
        </>,
    );

    expect(screen.getByText("Running").querySelector("[aria-hidden]")?.className).toContain("motion-safe:animate-pulse");
    expect(screen.getByText("Passed").querySelector("[aria-hidden]")?.className).not.toContain("animate-pulse");
});
