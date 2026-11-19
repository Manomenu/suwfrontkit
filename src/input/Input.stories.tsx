import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./Input.js";

const meta = { component: Input, args: { "aria-label": "Ticker" } } satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { placeholder: "e.g. ASML" } };

export const Filled: Story = { args: { defaultValue: "ASML" } };

export const Invalid: Story = { args: { defaultValue: "??", "aria-invalid": true } };

export const Disabled: Story = { args: { defaultValue: "ASML", disabled: true } };
