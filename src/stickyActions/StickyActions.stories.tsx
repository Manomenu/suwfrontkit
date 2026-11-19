import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../button/Button.js";
import { StickyActions } from "./StickyActions.js";

const meta = { component: StickyActions } satisfies Meta<typeof StickyActions>;
export default meta;
type Story = StoryObj<typeof meta>;

export const AtTheEndOfAForm: Story = {
    args: { children: null },
    render: () => (
        <StickyActions>
            <Button>Save</Button>
            <Button variant="outline">Cancel</Button>
        </StickyActions>
    ),
};
