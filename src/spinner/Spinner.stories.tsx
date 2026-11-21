import type { Meta, StoryObj } from "@storybook/react-vite";

import { Spinner } from "./Spinner.js";

const meta = { component: Spinner, args: { label: "Loading the runs" } } satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
    render: (args) => (
        <div className="flex items-center gap-4 motion-reduce:*:animate-none">
            <Spinner {...args} />
            <Spinner {...args} size="sm" />
            <Spinner {...args} size="xs" />
        </div>
    ),
};
