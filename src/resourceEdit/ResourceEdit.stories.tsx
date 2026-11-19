import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactElement } from "react";

import { expect, userEvent, waitFor, within } from "storybook/test";

import { Field } from "../field/Field.js";
import { Input } from "../input/Input.js";
import { ResourceList } from "../resourceList/ResourceList.js";
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

function link(onClick: () => void, label: string, href: string): ReactElement {
    return (
        <a
            href={href}
            onClick={(event) => {
                event.preventDefault();
                onClick();
            }}
        >
            {label}
        </a>
    );
}

function CompaniesScreens() {
    const [list, setList] = useState(companies);
    const [open, setOpen] = useState<Company | null>(null);
    const [draft, setDraft] = useState<Company | null>(null);
    const [nameErrors, setNameErrors] = useState<string[]>([]);
    const [mistakes, setMistakes] = useState<string[]>([]);
    const close = () => {
        setOpen(null);
        setDraft(null);
        setNameErrors([]);
        setMistakes([]);
    };
    if (open === null || draft === null) {
        return (
            <ResourceList
                title="Companies"
                columns={[
                    { header: "Ticker", className: "font-medium", cell: (company) => company.ticker },
                    { header: "Name", cell: (company) => company.name },
                    { header: "Target price", className: "text-muted-foreground", cell: (company) => company.target },
                ]}
                rows={list}
                idOf={(company) => company.ticker}
                link={(company, label) => (
                    <a
                        href={`#companies/${company.ticker}`}
                        onClick={(event) => {
                            event.preventDefault();
                            setOpen(company);
                            setDraft(company);
                        }}
                    >
                        {label}
                    </a>
                )}
                add={(label) => <a href="#companies/new">{label}</a>}
                addLabel="Add a company"
                empty="No companies yet."
            />
        );
    }
    const save = () => {
        const names = draft.name.trim() === "" ? ["Write the company's name."] : [];
        const loose = Number(draft.target) > 0 ? [] : ["The target price must be a number above zero: write it without the currency."];
        setNameErrors(names);
        setMistakes(loose);
        if (names.length > 0 || loose.length > 0) return;
        setList(list.map((company) => (company.ticker === open.ticker ? draft : company)));
        close();
    };
    return (
        <ResourceEdit
            title={`Company ${open.ticker}`}
            back={(label) => link(close, label, "#companies")}
            backLabel="Back to companies"
            onSubmit={save}
            onCancel={close}
            refusal={nameErrors.length > 0 || mistakes.length > 0 ? "The company was not saved." : null}
            mistakes={mistakes}
            deletion={{
                onDelete: () => {
                    setList(list.filter((company) => company.ticker !== open.ticker));
                    close();
                },
                question: `Delete company ${open.ticker}?`,
                consequence: "This cannot be undone. Its theses and notes are deleted with it.",
                confirmLabel: "Delete company",
            }}
        >
            <CompanyFields company={draft} errors={{ name: nameErrors }} onChange={setDraft} />
        </ResourceEdit>
    );
}

const asml = companies[0] ?? { ticker: "", name: "", target: "" };

const meta = {
    component: ResourceEdit,
    args: {
        title: "Company ASML",
        back: (label: string) => <a href="#companies">{label}</a>,
        backLabel: "Back to companies",
        onSubmit: () => undefined,
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

export const ListEditRefuseDelete: Story = {
    render: () => <CompaniesScreens />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(within(canvas.getByRole("row", { name: /ASML Holding/ })).getByRole("link", { name: "Edit" }));
        await userEvent.clear(canvas.getByLabelText("Name"));
        await userEvent.click(canvas.getByRole("button", { name: "Save" }));
        await expect(canvas.getByText("Write the company's name.")).toBeVisible();
        await expect(canvas.getByRole("alert")).toHaveTextContent("The company was not saved.");
        await userEvent.click(canvas.getByRole("button", { name: "Delete" }));
        const dialog = await within(document.body).findByRole("alertdialog", { name: "Delete company ASML?" });
        await userEvent.click(within(dialog).getByRole("button", { name: "Delete company" }));
        await waitFor(() => expect(within(document.body).queryByRole("alertdialog")).toBeNull());
        await expect(canvas.getByRole("heading", { name: "Companies" })).toBeVisible();
        await expect(canvas.queryByRole("row", { name: /ASML Holding/ })).toBeNull();
    },
};

export const Editing: Story = {};

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
        mistakes: ["The target price must be a number above zero: write it without the currency."],
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
