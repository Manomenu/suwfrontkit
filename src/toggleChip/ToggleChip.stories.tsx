import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { ToggleChip } from "./ToggleChip.js";

const meta = {
    component: ToggleChip,
    args: { pressed: false, onPressedChange: fn(), children: "Archived" },
    render: function Render(args) {
        const [pressed, setPressed] = useState(args.pressed);
        return (
            <ToggleChip
                {...args}
                pressed={pressed}
                onPressedChange={(next) => {
                    setPressed(next);
                    args.onPressedChange(next);
                }}
            />
        );
    },
} satisfies Meta<typeof ToggleChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
    render: () => (
        <div className="flex items-center gap-3">
            <ToggleChip pressed={false} onPressedChange={() => undefined}>
                Archived
            </ToggleChip>
            <ToggleChip pressed onPressedChange={() => undefined}>
                Only rows that differ
            </ToggleChip>
            <ToggleChip pressed={false} disabled onPressedChange={() => undefined}>
                Off and disabled
            </ToggleChip>
            <ToggleChip pressed disabled onPressedChange={() => undefined}>
                On and disabled
            </ToggleChip>
        </div>
    ),
};

export const PressedOnClick: Story = {
    play: async ({ canvasElement, args }) => {
        const chip = within(canvasElement).getByRole("button", { name: "Archived" });
        await userEvent.click(chip);
        await expect(chip).toHaveAttribute("aria-pressed", "true");
        await expect(args.onPressedChange).toHaveBeenCalledWith(true);
    },
};

export const ExplainedOnHover: Story = {
    args: { children: "Only rows that differ", help: "Hide the rows that are the same in every run." },
    play: async ({ canvasElement }) => {
        await userEvent.hover(within(canvasElement).getByRole("button", { name: "Only rows that differ" }));
        await expect(await within(document.body).findByRole("tooltip")).toHaveTextContent("Hide the rows that are the same in every run.");
    },
};
