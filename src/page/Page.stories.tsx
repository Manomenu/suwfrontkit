import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { Badge } from "../badge/Badge.js";
import { Button } from "../button/Button.js";
import { Page } from "./Page.js";

const meta = { component: Page, args: { title: "Companies" } } satisfies Meta<typeof Page>;
export default meta;
type Story = StoryObj<typeof meta>;

const text =
    "The thesis rests on three things: the order book keeps growing, margins hold above forty percent, and no competitor reaches the newest machines within five years. Each of them can be checked every quarter.";

export const FullWidth: Story = {
    args: {
        actions: <Button>Add a company</Button>,
        titleAside: <Badge variant="info">3 new</Badge>,
        children: <div className="h-40 rounded-lg border border-dashed border-border" />,
    },
    play: async () => {
        await expect(document.title).toBe("Companies");
    },
};

export const ReadingWidth: Story = {
    args: { title: "Thesis: ASML", width: "reading", children: <p>{text}</p> },
};
