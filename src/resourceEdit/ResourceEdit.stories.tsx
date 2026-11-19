import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactElement } from "react";

import { Button } from "../button/Button.js";
import { Field } from "../field/Field.js";
import { Input } from "../input/Input.js";
import { Paper } from "../paper/Paper.js";
import { ResourceList } from "../resourceList/ResourceList.js";
import { ResourceEdit, type Deletion } from "./ResourceEdit.js";

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

function Confirmation({ question, answer }: { question: string; answer: Parameters<Deletion["confirm"]>[0] }) {
    return (
        <Paper role="alertdialog" aria-label={question} className="flex max-w-lg flex-col gap-3">
            <h2 className="text-base font-semibold">{question}</h2>
            <p className="text-sm text-muted-foreground">This cannot be undone. Its theses and notes are deleted with it.</p>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" autoFocus onClick={answer.onCancel}>
                    Keep it
                </Button>
                <Button type="button" variant="destructive" onClick={answer.onConfirm}>
                    Delete company
                </Button>
            </div>
        </Paper>
    );
}

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
                confirm: (answer) => <Confirmation question={`Delete company ${open.ticker}?`} answer={answer} />,
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
            confirm: (answer) => <Confirmation question="Delete company ASML?" answer={answer} />,
        },
        children: <CompanyFields company={asml} errors={{}} onChange={() => undefined} />,
    },
} satisfies Meta<typeof ResourceEdit>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ListEditRefuseDelete: Story = { render: () => <CompaniesScreens /> };

export const Editing: Story = {};

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
            confirm: () => null,
            blocked: "Used in 2 theses. Remove those references first.",
            failure: "The company could not be deleted: the server is not answering.",
        },
    },
};

export const Missing: Story = {
    args: { failure: "There is no company TSLA. It may have been deleted, or its ticker changed." },
};

export const Loading: Story = { args: { ready: false } };
