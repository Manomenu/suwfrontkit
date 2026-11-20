import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { ErrorBoundary } from "./ErrorBoundary.js";

const report = { failing: true };

function Report() {
    if (report.failing) throw new Error("Cannot read properties of undefined (reading 'steps')");
    return <p>The report is back.</p>;
}

function Failing() {
    return (
        <ErrorBoundary>
            <Report />
        </ErrorBoundary>
    );
}

const meta = {
    component: Failing,
    title: "ErrorBoundary",
    beforeEach: () => {
        report.failing = true;
    },
} satisfies Meta<typeof Failing>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ErrorScreen: Story = {};

export const TryAgain: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        report.failing = false;
        await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
        await expect(canvas.getByText("The report is back.")).toBeVisible();
    },
};
