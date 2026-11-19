import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type { Paging } from "../paginated/Paginated.js";
import { ResourceList, type ResourceColumn } from "./ResourceList.js";

interface Company {
    ticker: string;
    name: string;
}

const columns: ResourceColumn<Company>[] = [
    { header: "Ticker", className: "font-medium", cell: (company) => company.ticker },
    { header: "Name", cell: (company) => company.name },
];

const list = {
    title: "Companies",
    columns,
    idOf: (company: Company) => company.ticker,
    link: (company: Company, label: string) => <a href={`/companies/${company.ticker}`}>{label}</a>,
};

const rows: Company[] = [
    { ticker: "ASML", name: "ASML Holding" },
    { ticker: "DNP", name: "Dino Polska" },
];

it("draws a row per resource from the columns, each opened by the app's own link styled as a button", () => {
    render(<ResourceList {...list} rows={rows} />);

    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual(["Ticker", "Name", "Edit"]);
    const asml = screen.getByRole("row", { name: /ASML Holding/ });
    expect(within(asml).getByText("ASML").className).toBe("font-medium");
    const open = within(asml).getByRole("link", { name: "Edit" });
    expect(open.getAttribute("href")).toBe("/companies/ASML");
    expect(open.dataset["slot"]).toBe("button");
});

it("adds through the app's link, or shows the add button disabled", () => {
    const add = (label: string) => <a href="/companies/new">{label}</a>;
    const { rerender } = render(<ResourceList {...list} rows={rows} add={add} addLabel="Add a company" />);
    expect(screen.getByRole("link", { name: "Add a company" }).getAttribute("href")).toBe("/companies/new");

    rerender(<ResourceList {...list} rows={rows} add={add} addDisabled />);
    expect(screen.getByRole("button", { name: "Add" })).toHaveProperty("disabled", true);
    expect(screen.queryByRole("link", { name: "Add" })).toBeNull();
});

it("shows loading, a failure and the empty state instead of the table", () => {
    const { rerender } = render(<ResourceList {...list} rows={null} />);
    expect(screen.getByText("Loading…")).toBeDefined();

    rerender(<ResourceList {...list} rows={null} failure="Could not load." />);
    expect(screen.getByRole("alert").textContent).toBe("Could not load.");

    rerender(<ResourceList {...list} rows={[]} />);
    expect(screen.getByText("Nothing here yet.")).toBeDefined();
    expect(screen.queryByRole("table")).toBeNull();
});

it("pages through Paginated and keeps what goes above and below the list", () => {
    const onMove = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
    const paging: Paging = { page: 1, pages: 2, asking: false, failure: null, onMove };
    render(<ResourceList {...list} rows={rows} paging={paging} above={<p>filters</p>} below={<p>history</p>} />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onMove).toHaveBeenCalledWith(2);
    expect(screen.getByText("filters")).toBeDefined();
    expect(screen.getByText("history")).toBeDefined();
});
