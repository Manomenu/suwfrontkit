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

it("reserves the counter's cell for the widest text it can show, hidden from sight and from screen readers, in figures of one width", () => {
    render(<PreviousNext label="Current steps" counter="1/12" widestCounter="12/12" onPrevious={vi.fn()} onNext={vi.fn()} />);

    const counter = screen.getByText("1/12");
    const widest = screen.getByText("12/12");
    const cell = counter.parentElement;
    expect(widest.parentElement).toBe(cell);
    expect(cell?.className).toContain("inline-grid");
    expect(cell?.className).toContain("tabular-nums");
    expect(cell?.className).toContain("whitespace-nowrap");
    expect(counter.className).toContain("[grid-area:1/1]");
    expect(widest.className).toContain("[grid-area:1/1]");
    expect(widest.className).toContain("invisible");
    expect(widest.getAttribute("aria-hidden")).toBe("true");
    expect(counter.getAttribute("aria-live")).toBe("polite");
    expect(widest.hasAttribute("aria-live")).toBe(false);
});

it("without a widest text the counter takes its own width", () => {
    render(<PreviousNext label="Pages" counter="Page 1 of 9" onPrevious={vi.fn()} onNext={vi.fn()} />);

    expect(screen.getByText("Page 1 of 9").parentElement?.childElementCount).toBe(1);
    expect(screen.getByRole("group", { name: "Pages" }).textContent).toBe("PreviousPage 1 of 9Next");
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
