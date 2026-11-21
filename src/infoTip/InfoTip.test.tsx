import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { InfoTip } from "./InfoTip.js";

it("is a button named after what it explains and described by its help", () => {
    render(<InfoTip about="Margin" help="How far below the fair value the price is." />);

    const button = screen.getByRole("button", { name: "About Margin" });
    expect(document.getElementById(button.getAttribute("aria-describedby") ?? "")?.textContent).toBe(
        "How far below the fair value the price is.",
    );
});

it("takes help with markup, such as a list, and tells the app when it opens", () => {
    const onOpenChange = vi.fn();
    render(
        <InfoTip
            about="Employer name"
            onOpenChange={onOpenChange}
            help={
                <ul>
                    <li>Procedure Intake (draft)</li>
                </ul>
            }
        />,
    );

    const button = screen.getByRole("button", { name: "About Employer name" });
    expect(document.getElementById(button.getAttribute("aria-describedby") ?? "")?.querySelector("li")?.textContent).toBe(
        "Procedure Intake (draft)",
    );
    fireEvent.click(button);
    expect(onOpenChange).toHaveBeenCalledWith(true);
});

it("shows the icon it is given in place of the i, such as one that tells two tips apart", () => {
    render(<InfoTip about="Margin" help="How far below the fair value the price is." icon={<svg data-testid="usage-icon" />} />);

    const button = screen.getByRole("button", { name: "About Margin" });
    expect(button.querySelectorAll("svg")).toHaveLength(1);
    expect(button.querySelector("svg")?.getAttribute("data-testid")).toBe("usage-icon");
});
