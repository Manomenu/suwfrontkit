import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Badge } from "../badge/Badge.js";
import { Tooltip } from "./Tooltip.js";

const EXPLANATION = "The run's data changed since it ran: the agent, a scenario or a check was pushed again.";

const meta = {
    component: Tooltip,
    args: {
        label: EXPLANATION,
        children: <Badge variant="warning">Data changed</Badge>,
    },
    render: (args) => (
        <div className="flex h-40 items-end">
            <Tooltip {...args} />
        </div>
    ),
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const OpensOnHover: Story = {
    play: async ({ canvasElement }) => {
        await userEvent.hover(within(canvasElement).getByText("Data changed"));
        await expect(await within(document.body).findByRole("tooltip")).toHaveTextContent(EXPLANATION);
    },
};
