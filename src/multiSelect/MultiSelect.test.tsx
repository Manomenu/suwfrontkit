import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MultiSelect } from "./MultiSelect.js";

const tags = [
    { value: "billing", label: "Billing" },
    { value: "procedure", label: "Procedure" },
    { value: "smoke", label: "Smoke test" },
];

function Tags({ initial, onValueChange }: { initial: string[]; onValueChange?: (value: string[]) => void }) {
    const [value, setValue] = useState(initial);
    return (
        <MultiSelect
            label="Tags"
            options={tags}
            value={value}
            onValueChange={(next) => {
                setValue(next);
                onValueChange?.(next);
            }}
        />
    );
}

function combobox() {
    return screen.getByRole("combobox", { name: "Tags" });
}

beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
});

describe("MultiSelect", () => {
    it("is a collapsed combobox that controls a multi-selectable listbox", () => {
        render(<Tags initial={[]} />);

        expect(combobox().getAttribute("aria-expanded")).toBe("false");
        expect(screen.queryByRole("listbox")).toBeNull();
        fireEvent.click(combobox());
        const list = screen.getByRole("listbox", { name: "Tags" });
        expect(combobox().getAttribute("aria-expanded")).toBe("true");
        expect(combobox().getAttribute("aria-controls")).toBe(list.id);
        expect(list.getAttribute("aria-multiselectable")).toBe("true");
        expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("narrows the options to the query and picks the first one with Enter", () => {
        const onValueChange = vi.fn();
        render(<Tags initial={[]} onValueChange={onValueChange} />);

        fireEvent.change(combobox(), { target: { value: "smo" } });
        expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Smoke test"]);
        fireEvent.keyDown(combobox(), { key: "Enter" });

        expect(onValueChange).toHaveBeenLastCalledWith(["smoke"]);
        expect((combobox() as HTMLInputElement).value).toBe("");
        expect(screen.getByRole("button", { name: "Remove Smoke test" })).toBeDefined();
    });

    it("walks the options with the arrows, wrapping at the ends, and marks the active one for assistive technology", () => {
        render(<Tags initial={[]} />);

        fireEvent.keyDown(combobox(), { key: "ArrowDown" });
        expect(document.getElementById(combobox().getAttribute("aria-activedescendant") ?? "")?.textContent).toBe("Billing");
        fireEvent.keyDown(combobox(), { key: "ArrowUp" });
        expect(document.getElementById(combobox().getAttribute("aria-activedescendant") ?? "")?.textContent).toBe("Smoke test");
        fireEvent.keyDown(combobox(), { key: "ArrowDown" });
        expect(document.getElementById(combobox().getAttribute("aria-activedescendant") ?? "")?.textContent).toBe("Billing");
    });

    it("toggles an option with Enter or a click, keeps the list open and returns the value in the order of the options", () => {
        const onValueChange = vi.fn();
        render(<Tags initial={["smoke"]} onValueChange={onValueChange} />);

        fireEvent.keyDown(combobox(), { key: "ArrowDown" });
        fireEvent.keyDown(combobox(), { key: "Enter" });
        expect(onValueChange).toHaveBeenLastCalledWith(["billing", "smoke"]);
        expect(screen.getByRole("option", { name: "Billing" }).getAttribute("aria-selected")).toBe("true");

        fireEvent.click(screen.getByRole("option", { name: "Smoke test" }));
        expect(onValueChange).toHaveBeenLastCalledWith(["billing"]);
        expect(screen.getByRole("listbox")).toBeDefined();
    });

    it("closes with Escape, then clears the query with a second Escape", () => {
        render(<Tags initial={[]} />);

        fireEvent.change(combobox(), { target: { value: "bil" } });
        fireEvent.keyDown(combobox(), { key: "Escape" });
        expect(screen.queryByRole("listbox")).toBeNull();
        expect((combobox() as HTMLInputElement).value).toBe("bil");
        fireEvent.keyDown(combobox(), { key: "Escape" });
        expect((combobox() as HTMLInputElement).value).toBe("");
    });

    it("removes the last chosen value with Backspace in an empty query, and one value with its remove button", () => {
        const onValueChange = vi.fn();
        render(<Tags initial={["billing", "procedure", "smoke"]} onValueChange={onValueChange} />);

        fireEvent.keyDown(combobox(), { key: "Backspace" });
        expect(onValueChange).toHaveBeenLastCalledWith(["billing", "procedure"]);
        fireEvent.click(screen.getByRole("button", { name: "Remove Billing" }));
        expect(onValueChange).toHaveBeenLastCalledWith(["procedure"]);
        expect(document.activeElement).toBe(combobox());
    });

    it("clears every value at once", () => {
        const onValueChange = vi.fn();
        render(<Tags initial={["billing", "smoke"]} onValueChange={onValueChange} />);

        fireEvent.click(screen.getByRole("button", { name: "Clear" }));

        expect(onValueChange).toHaveBeenLastCalledWith([]);
        expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    });

    it("says when nothing matches the query", () => {
        render(<Tags initial={[]} />);

        fireEvent.change(combobox(), { target: { value: "zzz" } });

        expect(screen.getByRole("status").textContent).toBe("Nothing found");
        expect(combobox().getAttribute("aria-expanded")).toBe("false");
    });

    it("keeps showing a chosen value that is no longer among the options", () => {
        render(<MultiSelect label="Tags" options={tags} value={["gone"]} onValueChange={() => undefined} />);

        expect(screen.getByRole("button", { name: "Remove gone" })).toBeDefined();
    });

    it("takes its words from props and the id, invalid state and description from a Field", () => {
        render(
            <MultiSelect
                label="Tagi"
                options={tags}
                value={["billing"]}
                onValueChange={() => undefined}
                id="filter-tags"
                aria-invalid
                aria-describedby="filter-tags-mistakes"
                clearLabel="Wyczyść"
                removeLabel={(choice) => `Usuń ${choice}`}
                emptyLabel="Brak"
            />,
        );

        const input = screen.getByRole("combobox", { name: "Tagi" });
        expect(input.id).toBe("filter-tags");
        expect(input.getAttribute("aria-invalid")).toBe("true");
        expect(input.getAttribute("aria-describedby")).toBe("filter-tags-mistakes");
        expect(screen.getByRole("button", { name: "Wyczyść" })).toBeDefined();
        expect(screen.getByRole("button", { name: "Usuń Billing" })).toBeDefined();
        fireEvent.change(input, { target: { value: "zzz" } });
        expect(screen.getByRole("status").textContent).toBe("Brak");
    });
});
