import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Panel, Paper } from "./Paper.js";

it("a panel is a region named by its heading", () => {
    render(
        <Panel title="Valuation">
            <p>Six percent a year.</p>
        </Panel>,
    );

    expect(screen.getByRole("region", { name: "Valuation" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Valuation", level: 2 })).toBeDefined();
});

it("paper keeps the caller's classes", () => {
    render(<Paper data-testid="paper" className="p-8" />);

    expect(screen.getByTestId("paper").className).toContain("p-8");
    expect(screen.getByTestId("paper").className).not.toContain("p-4");
});
