import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { GraphicSplit } from "./GraphicSplit.js";

it("puts the data on the left and the graphic on the right, held in view while the data scrolls", () => {
    const { container } = render(
        <GraphicSplit graphic={<p>diagram</p>}>
            <p>form</p>
        </GraphicSplit>,
    );

    const columns = [...container.querySelectorAll("[data-column]")].map((column) => [
        column.getAttribute("data-column"),
        column.textContent,
    ]);
    expect(columns).toEqual([
        ["data", "form"],
        ["graphic", "diagram"],
    ]);
    expect(container.querySelector('[data-column="graphic"]')?.className).toContain("sticky");
});

it("without a graphic gives the data the whole width", () => {
    const { container } = render(
        <GraphicSplit graphic={null}>
            <p>form</p>
        </GraphicSplit>,
    );

    expect(container.querySelector("[data-column]")).toBeNull();
    expect(container.textContent).toBe("form");
});
