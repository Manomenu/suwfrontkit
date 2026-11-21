import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Paper } from "./Paper.js";

it("paper with a title is a region named by its heading", () => {
    render(
        <Paper title="Valuation">
            <p>Six percent a year.</p>
        </Paper>,
    );

    expect(screen.getByRole("region", { name: "Valuation" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Valuation", level: 2 })).toBeDefined();
});

it("paper without a title is no region and has no heading", () => {
    render(<Paper>Six percent a year.</Paper>);

    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
});

it("paper keeps the caller's classes", () => {
    render(<Paper data-testid="paper" className="p-8" />);

    expect(screen.getByTestId("paper").className).toContain("p-8");
    expect(screen.getByTestId("paper").className).not.toContain("p-4");
});
