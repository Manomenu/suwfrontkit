import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { InfoTip } from "./InfoTip.js";

const HELP = "How far below the fair value the price is, in percent.";

const meta = {
    component: InfoTip,
    args: { about: "Margin of safety", help: HELP },
} satisfies Meta<typeof InfoTip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const OpensOnClick: Story = {
    play: async ({ canvasElement, args }) => {
        await userEvent.click(within(canvasElement).getByRole("button", { name: `About ${args.about}` }));
        await expect(await within(document.body).findByRole("tooltip")).toHaveTextContent(HELP);
    },
};

export const ListedHelp: Story = {
    args: {
        about: "where Employer name is used",
        help: (
            <ul className="flex flex-col gap-1">
                <li>Procedure Intake (draft): Collect documents — reads</li>
                <li>Procedure Demand (version 3): Send the letter — sets</li>
            </ul>
        ),
    },
    play: async ({ canvasElement, args }) => {
        await userEvent.click(within(canvasElement).getByRole("button", { name: `About ${args.about}` }));
        await expect(await within(document.body).findByRole("tooltip")).toHaveTextContent("Procedure Demand (version 3)");
    },
};
