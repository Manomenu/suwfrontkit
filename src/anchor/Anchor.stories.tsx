import type { Meta, StoryObj } from "@storybook/react-vite";

import { Anchor } from "./Anchor.js";

const meta = { component: Anchor } satisfies Meta<typeof Anchor>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Link: Story = { args: { href: "#theses", children: "Open the thesis" } };

export const AsChild: Story = {
    render: () => (
        <Anchor asChild>
            <a href="#briefs">Briefs of this week</a>
        </Anchor>
    ),
};
