import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Diff } from "./Diff.js";

const before = `name: Shop assistant
persona: friendly
rules:
  - Keep answers short.
  - Never promise a delivery date.
  - Answer in the customer's language.
opening hours: 9-17
contact: shop@example.com
`;

const after = `name: Shop assistant
persona: friendly and precise
rules:
  - Answer in one sentence.
  - Never promise a delivery date.
  - Answer in the customer's language.
  - Link the price list when asked about prices.
opening hours: 9-17
contact: shop@example.com
`;

const long = Array.from({ length: 30 }, (_, index) => `Paragraph ${String(index + 1)} of the terms of service.`).join("\n");

const meta = {
    component: Diff,
    args: { before, after },
    render: (args) => (
        <div className="w-[960px]">
            <Diff {...args} />
        </div>
    ),
} satisfies Meta<typeof Diff>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Unified: Story = {};

export const SideBySide: Story = { args: { view: "split", labels: { before: "Version 3", after: "Version 4" } } };

export const FoldsUnchangedLines: Story = {
    args: { before: long, after: long.replace("Paragraph 15 of", "Paragraph 15, changed, of") },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Show 11 unchanged lines" }));
        await expect(canvas.getByText("Paragraph 1 of the terms of service.")).toBeVisible();
    },
};

export const Identical: Story = { args: { after: before } };
