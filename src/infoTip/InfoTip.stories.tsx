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

export const WithAnIcon: Story = {
    args: {
        about: "where Employer name is used",
        help: "Procedure Intake (draft): Collect documents — reads",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M3 12h4l3-8 4 16 3-8h4" />
            </svg>
        ),
    },
    play: async ({ canvasElement, args }) => {
        await expect(
            within(canvasElement)
                .getByRole("button", { name: `About ${args.about}` })
                .querySelector("path"),
        ).toHaveAttribute("d", "M3 12h4l3-8 4 16 3-8h4");
    },
};
