import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./Badge.js";

const meta = { component: Badge } satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            <Badge>Draft</Badge>
            <Badge variant="primary">Open</Badge>
            <Badge variant="success">Done</Badge>
            <Badge variant="warning">Late</Badge>
            <Badge variant="danger">Failed</Badge>
            <Badge variant="info">New</Badge>
        </div>
    ),
};

export const WithADot: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            <Badge variant="success" dot>
                Passed
            </Badge>
            <Badge variant="danger" dot>
                Down
            </Badge>
            <Badge variant="info" dot="pulsing">
                Running
            </Badge>
        </div>
    ),
};
