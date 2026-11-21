import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { SegmentedControl } from "./SegmentedControl.js";

const OPTIONS = [
    { value: "7", label: "7 days" },
    { value: "30", label: "30 days" },
    { value: "90", label: "90 days" },
] as const;

function Period({ disabled }: { disabled: boolean }) {
    const [period, setPeriod] = useState<"7" | "30" | "90">("30");
    return <SegmentedControl label="Period" options={OPTIONS} value={period} onValueChange={setPeriod} disabled={disabled} />;
}

const meta = { component: Period, title: "SegmentedControl", args: { disabled: false } } satisfies Meta<typeof Period>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

export const ChecksTheClickedOption: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("radio", { name: "7 days" }));
        await expect(canvas.getByRole("radio", { name: "7 days" })).toHaveAttribute("aria-checked", "true");
        await expect(canvas.getByRole("radio", { name: "30 days" })).toHaveAttribute("aria-checked", "false");
    },
};
