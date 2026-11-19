import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "../input/Input.js";
import { Label } from "./Label.js";

const meta = { component: Label } satisfies Meta<typeof Label>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithControl: Story = {
    render: () => (
        <div className="flex w-80 flex-col gap-2">
            <Label htmlFor="story-name">Name</Label>
            <Input id="story-name" defaultValue="Growth portfolio" />
        </div>
    ),
};
