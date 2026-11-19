import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { StickyActions } from "./StickyActions.js";

it("sticks to the bottom of the scrolling form", () => {
    render(
        <StickyActions>
            <button type="button">Save</button>
        </StickyActions>,
    );

    expect(screen.getByRole("button", { name: "Save" }).parentElement?.className).toContain("sticky bottom-0");
});
