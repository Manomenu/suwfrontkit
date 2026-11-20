import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Badge } from "../badge/Badge.js";
import { Button } from "../button/Button.js";
import { Diff } from "../diff/Diff.js";
import { Panel } from "../paper/Paper.js";
import { History, type HistoryEntry } from "./History.js";

const entries: HistoryEntry[] = [
    {
        id: "4",
        at: "2026-11-19T14:05:00Z",
        who: "Anna Nowak",
        what: (
            <>
                <Badge variant="primary">edited</Badge> the article Prices
            </>
        ),
        details: <p>Title: Prices → Price list</p>,
    },
    {
        id: "3",
        at: "2026-11-18T09:30:00Z",
        who: "Publishing bot",
        what: (
            <>
                <Badge variant="success">published</Badge> version 4
            </>
        ),
    },
    {
        id: "2",
        at: "2026-11-02T17:45:00Z",
        who: "Piotr Wiśniewski",
        what: (
            <>
                <Badge variant="danger">deleted</Badge> the fact Opening hours
            </>
        ),
    },
];

const meta = {
    component: History,
    args: { entries, locale: "en-GB", timeZone: "UTC" },
    render: (args) => (
        <div className="w-[720px]">
            <Panel title="History">
                <History {...args} />
            </Panel>
        </div>
    ),
} satisfies Meta<typeof History>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Entries: Story = {};

export const Empty: Story = { args: { entries: [] } };

export const InPolish: Story = {
    args: { locale: "pl-PL", timeZone: "Europe/Warsaw", labels: { list: "Historia", empty: "Brak zmian.", details: "Szczegóły" } },
};

const many: HistoryEntry[] = Array.from({ length: 45 }, (_, index) => ({
    id: String(45 - index),
    at: new Date(Date.UTC(2026, 10, 19, 12) - index * 3_600_000),
    who: index % 3 === 0 ? "Publishing bot" : "Anna Nowak",
    what: `changed the fact Opening hours, revision ${String(45 - index)}`,
}));

export const PagesThroughTheWholeList: Story = {
    args: { entries: many, pageSize: 10 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Next" }));
        await expect(canvas.getByText("Page 2 of 5")).toBeVisible();
        await expect(canvas.getByText("changed the fact Opening hours, revision 35")).toBeVisible();
    },
};

const PAGE_SIZE = 10;

function FromTheServer() {
    const [page, setPage] = useState(1);
    const fetched = many.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return (
        <div className="w-[720px]">
            <Panel title="Historia">
                <History
                    entries={fetched}
                    page={page}
                    onPageChange={setPage}
                    pageSize={PAGE_SIZE}
                    hasNext={page * PAGE_SIZE < many.length}
                    locale="pl-PL"
                    timeZone="Europe/Warsaw"
                    labels={{ list: "Historia", previous: "Wstecz", next: "Dalej", page: (shown) => `Strona ${String(shown)}` }}
                />
            </Panel>
        </div>
    );
}

export const PagesFromTheServer: Story = {
    render: () => <FromTheServer />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole("button", { name: "Wstecz" })).toBeDisabled();
        await userEvent.click(canvas.getByRole("button", { name: "Dalej" }));
        await expect(canvas.getByText("Strona 2")).toBeVisible();
    },
};

function WithDiffs() {
    const [shown, setShown] = useState<string | null>(null);
    return (
        <div className="w-[960px]">
            <Panel title="History">
                <History
                    locale="en-GB"
                    timeZone="UTC"
                    entries={entries.map((entry) => ({
                        ...entry,
                        actions: (
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={() => {
                                    setShown(entry.id);
                                }}
                            >
                                Show the diff
                            </Button>
                        ),
                    }))}
                />
                {shown !== null && <Diff before={"Prices\nMonday to Friday\n"} after={"Price list\nMonday to Friday\n"} />}
            </Panel>
        </div>
    );
}

export const ShowsADiffOnRequest: Story = {
    render: () => <WithDiffs />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const [first] = canvas.getAllByRole("button", { name: "Show the diff" });
        if (first === undefined) throw new Error("no entry has an action");
        await userEvent.click(first);
        await expect(canvas.getByRole("table")).toHaveTextContent("Price list");
    },
};
