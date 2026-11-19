import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "./Textarea.js";

const meta = { component: Textarea, args: { "aria-label": "Note" } } satisfies Meta<typeof Textarea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Filled: Story = { args: { defaultValue: "Margins grew for the third quarter in a row.\nWatch the order book." } };

export const Invalid: Story = { args: { defaultValue: "", "aria-invalid": true } };
