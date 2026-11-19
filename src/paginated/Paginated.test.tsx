import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Paginated, type Paging } from "./Paginated.js";

const paging: Paging = { page: 2, pages: 3, asking: false, failure: null, onMove: () => undefined };

it("moves to the next and the previous page", () => {
    const onMove = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
    render(
        <Paginated paging={{ ...paging, onMove }}>
            <p>rows</p>
        </Paginated>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));

    expect(onMove.mock.calls).toEqual([[3], [1]]);
    expect(screen.getByText("Page 2 of 3")).toBeDefined();
});

it("with one page keeps the controls' space but hides them", () => {
    const { container } = render(
        <Paginated paging={{ ...paging, page: 1, pages: 1 }}>
            <p>rows</p>
        </Paginated>,
    );

    const group = container.querySelector('[aria-label="Pages"]');
    expect(group?.getAttribute("aria-hidden")).toBe("true");
    expect(group?.className).toContain("invisible");
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
});

it("shows the failure instead of the rows, and a loading line while asking", () => {
    const { rerender } = render(<Paginated paging={{ ...paging, failure: "Could not load." }}>rows</Paginated>);
    expect(screen.getByRole("alert").textContent).toBe("Could not load.");

    rerender(<Paginated paging={{ ...paging, asking: true }}>rows</Paginated>);
    expect(screen.getByText("Loading…")).toBeDefined();
});
