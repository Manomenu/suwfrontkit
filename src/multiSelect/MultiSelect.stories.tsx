import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { Field } from "../field/Field.js";
import { MultiSelect } from "./MultiSelect.js";

const meta = {
    component: MultiSelect,
    args: {
        label: "Tags",
        options: [
            { value: "billing", label: "billing" },
            { value: "escalation", label: "escalation" },
            { value: "procedure", label: "procedure" },
            { value: "serviceability", label: "serviceability" },
            { value: "smoke", label: "smoke" },
            { value: "tone", label: "tone" },
        ],
        value: [],
        onValueChange: fn(),
        placeholder: "Every scenario, type to find a tag",
    },
    render: function Render(args) {
        const [value, setValue] = useState(args.value);
        return (
            <div className="h-80 w-[480px]">
                <MultiSelect
                    {...args}
                    value={value}
                    onValueChange={(next) => {
                        setValue(next);
                        args.onValueChange(next);
                    }}
                />
            </div>
        );
    },
} satisfies Meta<typeof MultiSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Chosen: Story = { args: { value: ["procedure", "serviceability", "gone-from-data"] } };

export const Disabled: Story = { args: { value: ["procedure"], disabled: true } };

export const SearchesAndPicksWithTheKeyboard: Story = {
    args: { value: ["smoke"] },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole("combobox", { name: "Tags" });
        await userEvent.click(input);
        await userEvent.keyboard("e");
        await expect(canvas.getAllByRole("option")).toHaveLength(5);
        await userEvent.keyboard("{Enter}");
        await expect(args.onValueChange).toHaveBeenLastCalledWith(["escalation", "smoke"]);
        await userEvent.keyboard("{ArrowDown}");
        await expect(canvas.getByRole("option", { name: "procedure" })).toHaveAttribute("data-active");
    },
};

export const NothingFound: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByRole("combobox", { name: "Tags" }), "zzz");
        await expect(canvas.getByRole("status")).toHaveTextContent("Nothing found");
    },
};

export const InAField: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<string[]>([]);
        return (
            <div className="w-[480px]">
                <Field
                    prefix="story"
                    name="tags"
                    label="Tags"
                    hint="Scenarios with any of these tags."
                    errors={["Choose at least one tag."]}
                >
                    {(props) => <MultiSelect {...props} {...args} value={value} onValueChange={setValue} />}
                </Field>
            </div>
        );
    },
};
