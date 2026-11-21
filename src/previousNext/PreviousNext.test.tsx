import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PreviousNext } from "./PreviousNext.js";

it("is a group named by its label, with the counter between Previous and Next", () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(<PreviousNext label="Current steps" counter="1 of 3" onPrevious={onPrevious} onNext={onNext} />);

    const group = screen.getByRole("group", { name: "Current steps" });
    expect(group.textContent).toBe("Previous1 of 3Next");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(onNext).toHaveBeenCalledOnce();
    expect(onPrevious).toHaveBeenCalledOnce();
});

it("keeps the counter in a slot of its own width, with figures of one width, so a longer text does not move the buttons", () => {
    render(<PreviousNext label="Pages" counter="Page 1 of 9" onPrevious={vi.fn()} onNext={vi.fn()} />);

    const counter = screen.getByText("Page 1 of 9");
    expect(counter.className).toContain("min-w-[16ch]");
    expect(counter.className).toContain("tabular-nums");
    expect(counter.className).toContain("whitespace-nowrap");
});

it("says why a disabled button is disabled, next to it and as its description", () => {
    render(
        <PreviousNext
            label="Current steps"
            counter="0 current steps"
            onPrevious={vi.fn()}
            onNext={vi.fn()}
            previousLabel="Previous current step"
            nextLabel="Next current step"
            previousDisabled
            nextDisabled
            reason="The run is finished."
        />,
    );

    const next = screen.getByRole("button", { name: "Next current step" });
    expect(next).toHaveProperty("disabled", true);
    expect(document.getElementById(next.getAttribute("aria-describedby") ?? "")?.textContent).toBe("The run is finished.");
});

it("shows no reason while both buttons work", () => {
    render(<PreviousNext label="Pages" counter="Page 2 of 3" onPrevious={vi.fn()} onNext={vi.fn()} reason="Nothing more." />);

    expect(screen.queryByText("Nothing more.")).toBeNull();
    expect(screen.getByRole("button", { name: "Next" }).hasAttribute("aria-describedby")).toBe(false);
});
