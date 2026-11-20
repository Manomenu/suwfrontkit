import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusBadge } from "./StatusBadge.js";

const meta = { component: StatusBadge, args: { status: "success", children: "Passed" } } satisfies Meta<typeof StatusBadge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Statuses: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status="success">Passed</StatusBadge>
            <StatusBadge status="warning">Not judged</StatusBadge>
            <StatusBadge status="danger">Failed</StatusBadge>
            <StatusBadge status="info">New</StatusBadge>
            <StatusBadge status="neutral">Draft</StatusBadge>
            <StatusBadge status="pending">Running</StatusBadge>
        </div>
    ),
};
