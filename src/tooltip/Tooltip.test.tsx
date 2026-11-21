import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Tooltip } from "./Tooltip.js";

it("shows its label beside the element it explains once that element has the focus", async () => {
    render(
        <Tooltip label="The share of checks that passed.">
            <button type="button">Pass rate</button>
        </Tooltip>,
    );

    await act(async () => {
        fireEvent.focus(screen.getByRole("button", { name: "Pass rate" }));
        await Promise.resolve();
    });

    expect(screen.getByRole("tooltip").textContent).toBe("The share of checks that passed.");
});

it("leaves the element alone while disabled", () => {
    const { container } = render(
        <Tooltip label="Never shown" disabled>
            <span>Plain</span>
        </Tooltip>,
    );

    expect(container.innerHTML).toBe("<span>Plain</span>");
});
