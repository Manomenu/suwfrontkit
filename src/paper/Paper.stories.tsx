import type { Meta, StoryObj } from "@storybook/react-vite";

import { Panel, Paper } from "./Paper.js";

const meta = { component: Paper } satisfies Meta<typeof Paper>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = { args: { children: "A card on the page background." } };

export const TitledPanel: Story = {
    render: () => (
        <Panel title="Valuation">
            <p className="text-sm text-muted-foreground">The price implies 6% growth a year for the next decade.</p>
        </Panel>
    ),
};
