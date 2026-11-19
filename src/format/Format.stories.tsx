import type { Meta, StoryObj } from "@storybook/react-vite";

import { Table } from "../table/Table.js";
import { formatPercent, formatSeconds } from "./numbers.js";
import { formatDate, formatDateTime, formatTime } from "./time.js";

const MOMENT = "2026-11-17T15:41:00";

const rows: [string, string, string][] = [
    ["formatDateTime", MOMENT, formatDateTime(MOMENT)],
    ["formatDate", MOMENT, formatDate(MOMENT)],
    ["formatTime", MOMENT, formatTime(MOMENT)],
    ["formatDateTime", "null", formatDateTime(null)],
    ["formatPercent", "0.6667", formatPercent(0.6667)],
    ["formatPercent", "1", formatPercent(1)],
    ["formatSeconds", "9800", formatSeconds(9800)],
    ["formatSeconds", "109050", formatSeconds(109_050)],
];

function FormatExamples() {
    return (
        <Table className="w-auto">
            <thead>
                <tr>
                    <th>Function</th>
                    <th>Given</th>
                    <th>Shows</th>
                </tr>
            </thead>
            <tbody>
                {rows.map(([name, given, shows]) => (
                    <tr key={`${name}-${given}`}>
                        <td className="font-mono">{name}</td>
                        <td className="font-mono">{given}</td>
                        <td>{shows}</td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

const meta = { component: FormatExamples, title: "Format" } satisfies Meta<typeof FormatExamples>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Examples: Story = {};
