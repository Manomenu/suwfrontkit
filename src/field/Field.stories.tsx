import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../button/Button.js";
import { Input } from "../input/Input.js";
import { Field, Legend } from "./Field.js";

const meta = { component: Field } satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithHint: Story = {
    args: {
        prefix: "story",
        name: "ticker",
        label: "Ticker",
        hint: "The exchange symbol, as on the quote page.",
        errors: [],
        children: () => null,
    },
    render: (args) => (
        <div className="w-96">
            <Field {...args}>{(props) => <Input {...props} defaultValue="ASML" />}</Field>
        </div>
    ),
};

export const WithErrorsAndAction: Story = {
    args: {
        prefix: "story",
        name: "target",
        label: "Target price",
        hint: "The price at which the thesis is fulfilled.",
        errors: ["Write a number greater than zero."],
        children: () => null,
    },
    render: (args) => (
        <div className="w-96">
            <Field
                {...args}
                action={
                    <Button size="sm" variant="outline">
                        Suggest
                    </Button>
                }
            >
                {(props) => <Input {...props} defaultValue="-5" />}
            </Field>
        </div>
    ),
};

export const LegendOfAGroup: Story = {
    args: { prefix: "story", name: "unused", label: "unused", hint: "unused", errors: [], children: () => null },
    render: () => (
        <fieldset className="flex flex-col gap-2">
            <Legend hint="Which markets the screen shows.">Markets</Legend>
            <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked /> Warsaw
            </label>
            <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" /> Nasdaq
            </label>
        </fieldset>
    ),
};
