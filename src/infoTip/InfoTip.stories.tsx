import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { InfoTip } from "./InfoTip.js";

const meta = {
    component: InfoTip,
    args: { about: "Margin of safety", help: "How far below the fair value the price is, in percent." },
} satisfies Meta<typeof InfoTip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const OpensOnClick: Story = {
    play: async ({ canvasElement, args }) => {
        await userEvent.click(within(canvasElement).getByRole("button", { name: `About ${args.about}` }));
        await expect(await within(document.body).findByRole("tooltip")).toHaveTextContent(args.help);
    },
};
