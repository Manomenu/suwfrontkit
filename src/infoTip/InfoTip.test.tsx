import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { InfoTip } from "./InfoTip.js";

it("is a button named after what it explains and described by its help", () => {
    render(<InfoTip about="Margin" help="How far below the fair value the price is." />);

    const button = screen.getByRole("button", { name: "About Margin" });
    expect(document.getElementById(button.getAttribute("aria-describedby") ?? "")?.textContent).toBe(
        "How far below the fair value the price is.",
    );
});
