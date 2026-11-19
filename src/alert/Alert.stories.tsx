import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert } from "./Alert.js";

const meta = { component: Alert } satisfies Meta<typeof Alert>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
    render: () => (
        <div className="flex flex-col gap-3">
            <Alert>The import finished: 42 rows were added.</Alert>
            <Alert variant="warning">The price feed is 3 days old.</Alert>
            <Alert variant="destructive">The server refused the change: the name is taken.</Alert>
        </div>
    ),
};
