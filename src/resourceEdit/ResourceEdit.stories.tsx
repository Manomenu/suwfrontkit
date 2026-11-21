import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Field } from "../field/Field.js";
import { Input } from "../input/Input.js";
import { ResourceEdit } from "./ResourceEdit.js";

interface Company {
    ticker: string;
    name: string;
    target: string;
}

const companies: Company[] = [
    { ticker: "ASML", name: "ASML Holding", target: "900" },
    { ticker: "DNP", name: "Dino Polska", target: "520" },
    { ticker: "CDR", name: "CD Projekt", target: "180" },
];

function CompanyFields({
    company,
    errors,
    onChange,
}: {
    company: Company;
    errors: Partial<Record<keyof Company, string[]>>;
    onChange: (company: Company) => void;
}) {
    return (
        <>
            <Field prefix="company" name="name" label="Name" hint="The company's name as it trades." errors={errors.name ?? []}>
                {(props) => (
                    <Input
                        {...props}
                        value={company.name}
                        onChange={(event) => {
                            onChange({ ...company, name: event.currentTarget.value });
                        }}
                    />
                )}
            </Field>
            <Field
                prefix="company"
                name="target"
                label="Target price"
                hint="The price at which the thesis is fulfilled."
                errors={errors.target ?? []}
            >
                {(props) => (
                    <Input
                        {...props}
                        inputMode="decimal"
                        value={company.target}
                        onChange={(event) => {
                            onChange({ ...company, target: event.currentTarget.value });
                        }}
                    />
                )}
            </Field>
        </>
    );
}

const asml = companies[0] ?? { ticker: "", name: "", target: "" };

const meta = {
    component: ResourceEdit,
    args: {
        title: "Company ASML",
        backHref: "#companies",
        backLabel: "Back to companies",
        action: (): void => undefined,
        onCancel: () => undefined,
        deletion: {
            onDelete: () => undefined,
            question: "Delete company ASML?",
            consequence: "This cannot be undone. Its theses and notes are deleted with it.",
            confirmLabel: "Delete company",
        },
        children: <CompanyFields company={asml} errors={{}} onChange={() => undefined} />,
    },
} satisfies Meta<typeof ResourceEdit>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Editing: Story = {};

export const Saving: Story = {
    args: { action: () => new Promise<void>(() => undefined) },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: "Save" }));
        const busy = await canvas.findByRole("button", { name: "Saving…" });
        await expect(busy).toBeDisabled();
        await expect(busy).toHaveAttribute("aria-busy", "true");
    },
};

export const AskingToDelete: Story = {
    play: async ({ canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole("button", { name: "Delete" }));
        const dialog = await within(document.body).findByRole("alertdialog", { name: "Delete company ASML?" });
        await expect(within(dialog).getByRole("button", { name: "Keep it" })).toHaveFocus();
    },
};

export const Refused: Story = {
    args: {
        refusal: "The company was not saved.",
        mistakes: [
            {
                code: "thesis.target.invalid",
                message: "The target price must be a number above zero.",
                fix: "Write it without the currency.",
                at: "Target price",
            },
        ],
        children: (
            <CompanyFields
                company={{ ...asml, name: "", target: "-5" }}
                errors={{ name: ["Write the company's name."] }}
                onChange={() => undefined}
            />
        ),
    },
};

export const DeleteBlocked: Story = {
    args: {
        deletion: {
            onDelete: () => undefined,
            blocked: "Used in 2 theses. Remove those references first.",
            failure: "The company could not be deleted: the server is not answering.",
        },
    },
};

export const Missing: Story = {
    args: { failure: "There is no company TSLA. It may have been deleted, or its ticker changed." },
};

export const Loading: Story = { args: { ready: false } };
