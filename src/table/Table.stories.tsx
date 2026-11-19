import type { Meta, StoryObj } from "@storybook/react-vite";

import { Table } from "./Table.js";

const meta = { component: Table } satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
    { ticker: "ASML", name: "ASML Holding", price: "612.40", change: "+1.2%" },
    { ticker: "MSFT", name: "Microsoft", price: "418.05", change: "-0.4%" },
    { ticker: "CDR", name: "CD Projekt", price: "164.90", change: "+3.1%" },
];

export const Rows: Story = {
    render: () => (
        <Table>
            <thead>
                <tr>
                    <th>Ticker</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Change</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.ticker}>
                        <td>{row.ticker}</td>
                        <td>{row.name}</td>
                        <td>{row.price}</td>
                        <td>{row.change}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    ),
};
