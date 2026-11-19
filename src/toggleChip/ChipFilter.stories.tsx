import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { ChipFilter } from "./ChipFilter.js";

const meta = {
    title: "ChipFilter",
    component: ChipFilter,
    args: {
        label: "Usage",
        options: [
            { value: "evaluation", label: "Evaluation" },
            { value: "monitoring", label: "Monitoring" },
            { value: "playground", label: "Playground" },
            { value: "unused", label: "Not used" },
        ],
        value: [],
        onValueChange: fn(),
    },
    render: function Render(args) {
        const [value, setValue] = useState(args.value);
        return (
            <ChipFilter
                {...args}
                value={value}
                onValueChange={(next) => {
                    setValue(next);
                    args.onValueChange(next);
                }}
            />
        );
    },
} satisfies Meta<typeof ChipFilter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NothingChosen: Story = {};

export const TwoChosen: Story = { args: { value: ["evaluation", "monitoring"] } };

export const Disabled: Story = { args: { value: ["monitoring"], disabled: true } };

export const ChoosesAndClears: Story = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Playground" }));
        await userEvent.click(canvas.getByRole("button", { name: "Evaluation" }));
        await expect(args.onValueChange).toHaveBeenLastCalledWith(["evaluation", "playground"]);
        await expect(canvas.getByText("2 selected")).toBeVisible();
        await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
        await expect(args.onValueChange).toHaveBeenLastCalledWith([]);
        await expect(canvas.getByRole("button", { name: "Evaluation" })).toHaveFocus();
    },
};
