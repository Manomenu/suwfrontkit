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

export const KeepsItsButtonsInPlace: Story = {
    render: () => (
        <div className="flex w-fit flex-col items-start gap-2">
            {["1 of 1", "12 current steps"].map((counter) => (
                <PreviousNext
                    key={counter}
                    label={`Current steps: ${counter}`}
                    counter={counter}
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
        const [short, long] = ["1 of 1", "12 current steps"].map((counter) =>
            within(canvas.getByRole("group", { name: `Current steps: ${counter}` }))
                .getByRole("button", { name: "Next current step" })
                .getBoundingClientRect(),
        );
        await expect(long?.left).toBe(short?.left);
        await expect(long?.width).toBe(short?.width);
    },
};
