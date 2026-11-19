import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { ResourceList } from "../resourceList/ResourceList.js";
import { ResourceEdit, type Deletion } from "./ResourceEdit.js";

const confirm: Deletion["confirm"] = ({ onConfirm, onCancel }) => (
    <div role="alertdialog" aria-label="Delete company ASML?">
        <button type="button" onClick={onCancel}>
            Keep it
        </button>
        <button type="button" onClick={onConfirm}>
            Delete company
        </button>
    </div>
);

function Companies() {
    const [names, setNames] = useState(["ASML", "DNP"]);
    const [open, setOpen] = useState<string | null>(null);
    const [draft, setDraft] = useState("");
    const [mistakes, setMistakes] = useState<string[]>([]);
    if (open === null) {
        return (
            <ResourceList
                title="Companies"
                columns={[{ header: "Ticker", cell: (name) => name }]}
                rows={names}
                idOf={(name) => name}
                link={(name, label) => (
                    <a
                        href={`#${name}`}
                        onClick={(event) => {
                            event.preventDefault();
                            setOpen(name);
                            setDraft(name);
                        }}
                    >
                        {label}
                    </a>
                )}
            />
        );
    }
    return (
        <ResourceEdit
            title={`Company ${open}`}
            onSubmit={() => {
                setMistakes(draft === "" ? ["Write the ticker."] : []);
            }}
            refusal={mistakes.length > 0 ? "The company was not saved." : null}
            mistakes={mistakes}
            deletion={{
                confirm,
                onDelete: () => {
                    setNames(names.filter((name) => name !== open));
                    setOpen(null);
                },
            }}
        >
            <label>
                Ticker
                <input
                    value={draft}
                    onChange={(event) => {
                        setDraft(event.currentTarget.value);
                    }}
                />
            </label>
        </ResourceEdit>
    );
}

it("goes from the list to the edit screen, shows a refusal, and deletes only after the confirmation", () => {
    render(<Companies />);

    const asml = screen.getByRole("row", { name: /ASML/ });
    fireEvent.click(within(asml).getByRole("link", { name: "Edit" }));
    expect(screen.getByRole("heading", { name: "Company ASML" })).toBeDefined();

    fireEvent.change(screen.getByLabelText("Ticker"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("alert").textContent).toBe("The company was not saved.Write the ticker.");

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Keep it" }));
    expect(screen.queryByRole("alertdialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Delete company" }));
    expect(screen.getByRole("heading", { name: "Companies" })).toBeDefined();
    expect(screen.queryByRole("row", { name: /ASML/ })).toBeNull();
    expect(screen.getByRole("row", { name: /DNP/ })).toBeDefined();
});

it("draws the way back as the app's own link with the default label", () => {
    render(
        <ResourceEdit title="Company ASML" back={(label) => <a href="/companies">{label}</a>}>
            <p>fields</p>
        </ResourceEdit>,
    );

    const back = screen.getByRole("link", { name: "Back to the list" });
    expect(back.getAttribute("href")).toBe("/companies");
    expect(back.className).toContain("text-anchor");
});

it("without onSubmit draws the children as they are, with no form and no save button", () => {
    render(
        <ResourceEdit title="Procedure refund">
            <p>editor</p>
        </ResourceEdit>,
    );

    expect(screen.queryByRole("form")).toBeNull();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    expect(screen.getByText("editor")).toBeDefined();
});

it("submits without reloading, disables saving while it saves, and cancels", () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const { rerender } = render(
        <ResourceEdit title="Company ASML" onSubmit={onSubmit} onCancel={onCancel} saveLabel="Add">
            <p>fields</p>
        </ResourceEdit>,
    );

    fireEvent.submit(screen.getByRole("form", { name: "Company ASML" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();

    rerender(
        <ResourceEdit title="Company ASML" onSubmit={onSubmit} saving>
            <p>fields</p>
        </ResourceEdit>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toHaveProperty("disabled", true);
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
});

it("a blocked deletion disables Delete and says why, and a refused one shows the failure", () => {
    render(
        <ResourceEdit
            title="Company ASML"
            deletion={{ confirm, onDelete: vi.fn(), blocked: "Used in 2 theses.", failure: "The server is not answering." }}
        >
            <p>fields</p>
        </ResourceEdit>,
    );

    expect(screen.getByRole("button", { name: "Delete" })).toHaveProperty("disabled", true);
    expect(screen.getByText("Used in 2 theses.")).toBeDefined();
    expect(screen.getByRole("alert").textContent).toBe("The server is not answering.");
});

it("shows the loading line and a failure instead of the screen, keeping the way back", () => {
    const back = (label: string) => <a href="/companies">{label}</a>;
    const { rerender } = render(
        <ResourceEdit title="Company TSLA" back={back} ready={false}>
            <p>fields</p>
        </ResourceEdit>,
    );
    expect(screen.getByText("Loading…")).toBeDefined();
    expect(screen.queryByText("fields")).toBeNull();

    rerender(
        <ResourceEdit title="Company TSLA" back={back} failure="There is no company TSLA.">
            <p>fields</p>
        </ResourceEdit>,
    );
    expect(screen.getByRole("alert").textContent).toBe("There is no company TSLA.");
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByRole("link", { name: "Back to the list" })).toBeDefined();
});
