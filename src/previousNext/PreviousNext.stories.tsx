import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { PreviousNext } from "./PreviousNext.js";

const meta = {
    component: PreviousNext,
    args: { label: "Pages", counter: "Page 2 of 5", onPrevious: () => undefined, onNext: () => undefined },
} satisfies Meta<typeof PreviousNext>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
    args: {
        label: "Current steps",
        counter: "0 current steps",
        previousLabel: "Previous current step",
        nextLabel: "Next current step",
        previousDisabled: true,
        nextDisabled: true,
        reason: "The run is finished.",
        size: "xs",
    },
};

const STEP_COUNTERS = ["1/12", "12/12", "–/12"];

export const KeepsItsButtonsInPlace: Story = {
    render: () => (
        <div className="flex w-fit flex-col items-start gap-2">
            {STEP_COUNTERS.map((counter) => (
                <PreviousNext
                    key={counter}
                    label={`Current steps: ${counter}`}
                    counter={counter}
                    widestCounter="12/12"
                    size="xs"
                    previousLabel="Previous current step"
                    nextLabel="Next current step"
                    onPrevious={() => undefined}
                    onNext={() => undefined}
                />
            ))}
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const [first, ...others] = STEP_COUNTERS.map((counter) =>
            within(canvas.getByRole("group", { name: `Current steps: ${counter}` }))
                .getByRole("button", { name: "Next current step" })
                .getBoundingClientRect(),
        );
        for (const other of others) {
            await expect(other.left).toBe(first?.left);
            await expect(other.width).toBe(first?.width);
        }
    },
};

export const ShortCounterLeavesNoGap: Story = {
    args: {
        label: "Current steps",
        counter: "1/1",
        widestCounter: "1/1",
        previousLabel: "Previous current step",
        nextLabel: "Next current step",
        size: "xs",
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const previous = canvas.getByRole("button", { name: "Previous current step" }).getBoundingClientRect();
        const next = canvas.getByRole("button", { name: "Next current step" }).getBoundingClientRect();
        const counter = canvas.getByText("1/1", { selector: "[data-counter]" }).getBoundingClientRect();
        const gap = Number.parseFloat(getComputedStyle(canvas.getByRole("group")).columnGap);
        await expect(next.left - previous.right).toBeCloseTo(counter.width + 2 * gap, 0);
        await expect(counter.width).toBeLessThan(previous.width / 2);
    },
};
