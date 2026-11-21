import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Badge } from "../badge/Badge.js";
import type { Paging } from "../paginated/Paginated.js";
import { Select } from "../select/Select.js";
import { ResourceList, type ResourceColumn } from "./ResourceList.js";

interface Company {
    ticker: string;
    name: string;
    market: string;
    thesis: "holding" | "watching";
}

const companies: Company[] = [
    { ticker: "ASML", name: "ASML Holding", market: "Nasdaq", thesis: "holding" },
    { ticker: "DNP", name: "Dino Polska", market: "Warsaw", thesis: "holding" },
    { ticker: "CDR", name: "CD Projekt", market: "Warsaw", thesis: "watching" },
    { ticker: "NOVO-B", name: "Novo Nordisk", market: "Copenhagen", thesis: "watching" },
    { ticker: "MSFT", name: "Microsoft", market: "Nasdaq", thesis: "holding" },
];

const columns: ResourceColumn<Company>[] = [
    { header: "Ticker", className: "font-medium", cell: (company) => company.ticker },
    { header: "Name", cell: (company) => company.name },
    { header: "Market", className: "text-muted-foreground", cell: (company) => company.market },
    {
        header: "Thesis",
        cell: (company) => (
            <Badge variant={company.thesis === "holding" ? "success" : "info"}>
                {company.thesis === "holding" ? "Holding" : "Watching"}
            </Badge>
        ),
    },
];

const paging: Paging = { page: 1, pages: 3, asking: false, failure: null, onMove: () => undefined };

const meta = {
    component: ResourceList<Company>,
    args: {
        title: "Companies",
        columns,
        rows: companies,
        idOf: (company: Company) => company.ticker,
        hrefOf: (company: Company) => `#companies/${company.ticker}`,
        addHref: "#companies/new",
        addLabel: "Add a company",
    },
} satisfies Meta<typeof ResourceList<Company>>;
export default meta;
type Story = StoryObj<typeof meta>;

function MarketFilter({ onChange }: { onChange: (market: string) => void }) {
    return (
        <div className="flex gap-2">
            <Select
                aria-label="Market"
                className="w-56"
                onChange={(event) => {
                    onChange(event.currentTarget.value);
                }}
            >
                <option value="">All markets</option>
                <option>Nasdaq</option>
                <option>Warsaw</option>
                <option>Copenhagen</option>
            </Select>
        </div>
    );
}

function FilteredPages() {
    const [page, setPage] = useState(1);
    const [market, setMarket] = useState("");
    return (
        <ResourceList
            {...meta.args}
            rows={companies.filter((company) => market === "" || company.market === market)}
            paging={{ ...paging, page, onMove: setPage }}
            above={<MarketFilter onChange={setMarket} />}
        />
    );
}

export const WithFilterAndPages: Story = { render: () => <FilteredPages /> };

export const Empty: Story = {
    args: { rows: [], empty: "No companies yet. Add the first one you follow." },
};

export const Loading: Story = { args: { rows: null } };

export const Failed: Story = { args: { rows: null, failure: "The companies could not be loaded. Try again in a moment." } };

export const AddingDisabled: Story = {
    args: {
        addDisabled: true,
        openLabel: "Open",
        above: <p className="text-muted-foreground">Connect a market data source before adding a company.</p>,
    },
};
