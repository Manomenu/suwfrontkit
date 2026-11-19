import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Paginated, type Paging } from "./Paginated.js";

const meta = { component: Paginated } satisfies Meta<typeof Paginated>;
export default meta;
type Story = StoryObj<typeof meta>;

const paging: Paging = { page: 2, pages: 5, asking: false, failure: null, onMove: () => undefined };

function Moving() {
    const [page, setPage] = useState(1);
    return (
        <Paginated paging={{ ...paging, page, onMove: setPage }}>
            <p>{`Rows of page ${page}`}</p>
        </Paginated>
    );
}

export const SeveralPages: Story = { args: { paging, children: null }, render: () => <Moving /> };

export const OnePage: Story = { args: { paging: { ...paging, page: 1, pages: 1 }, children: <p>All rows</p> } };

export const Loading: Story = { args: { paging: { ...paging, asking: true }, children: null } };

export const Failed: Story = { args: { paging: { ...paging, failure: "The list could not be loaded." }, children: null } };
