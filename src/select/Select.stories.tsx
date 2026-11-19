import type { Meta, StoryObj } from "@storybook/react-vite";

import { Select } from "./Select.js";

const meta = { component: Select, args: { "aria-label": "Currency" } } satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Native: Story = {
    render: (args) => (
        <Select {...args} defaultValue="eur">
            <option value="pln">PLN</option>
            <option value="eur">EUR</option>
            <option value="usd">USD</option>
        </Select>
    ),
};
