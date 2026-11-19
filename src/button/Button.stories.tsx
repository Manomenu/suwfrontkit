import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./Button.js";

const meta = { component: Button, args: { children: "Save" } } satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
    render: (args) => (
        <div className="flex flex-wrap items-center gap-3">
            <Button {...args} />
            <Button {...args} variant="destructive">
                Delete
            </Button>
            <Button {...args} variant="outline">
                Cancel
            </Button>
            <Button {...args} variant="ghost">
                More
            </Button>
            <Button {...args} variant="link">
                Open
            </Button>
            <Button {...args} disabled>
                Disabled
            </Button>
        </div>
    ),
};

export const Sizes: Story = {
    render: (args) => (
        <div className="flex flex-wrap items-center gap-3">
            <Button {...args} />
            <Button {...args} size="sm" />
            <Button {...args} size="xs" />
            <Button {...args} size="icon" aria-label="Add">
                +
            </Button>
        </div>
    ),
};

export const AsChild: Story = {
    render: () => (
        <Button asChild variant="outline">
            <a href="#reports">Reports</a>
        </Button>
    ),
};
