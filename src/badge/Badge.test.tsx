import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Badge } from "./Badge.js";

it("is neutral by default and takes the info colours when asked", () => {
    render(
        <>
            <Badge>Draft</Badge>
            <Badge variant="info">New</Badge>
        </>,
    );

    expect(screen.getByText("Draft").className).toContain("bg-secondary");
    expect(screen.getByText("New").className).toContain("bg-info-light");
});

it("a dot is hidden from the accessible name, and only a pulsing dot pulses, when motion is welcome", () => {
    render(
        <>
            <Badge dot="pulsing">Running</Badge>
            <Badge dot>Passed</Badge>
            <Badge>Draft</Badge>
        </>,
    );

    expect(screen.getByText("Running").textContent).toBe("Running");
    expect(screen.getByText("Running").querySelector("[aria-hidden]")?.className).toContain("motion-safe:animate-pulse");
    expect(screen.getByText("Passed").querySelector("[aria-hidden]")?.className).not.toContain("animate-pulse");
    expect(screen.getByText("Draft").querySelector("[aria-hidden]")).toBeNull();
});
