import type { Meta, StoryObj } from "@storybook/react-vite";

import { CopyButton } from "./CopyButton.js";

const meta = {
    component: CopyButton,
    args: { value: "suwageval run --agent refunds --tag smoke", label: "Copy the command" },
} satisfies Meta<typeof CopyButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
