import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ChipFilter } from "./ChipFilter.js";
import { ToggleChip } from "./ToggleChip.js";

const statuses = [
    { value: "draft", label: "Draft" },
    { value: "open", label: "Open" },
    { value: "done", label: "Done" },
];

function Statuses({ initial, onValueChange }: { initial: string[]; onValueChange?: (value: string[]) => void }) {
    const [value, setValue] = useState(initial);
    return (
        <ChipFilter
            label="Status"
            options={statuses}
            value={value}
            onValueChange={(next) => {
                setValue(next);
                onValueChange?.(next);
            }}
        />
    );
}

describe("ToggleChip", () => {
    it("is a button that says whether it is pressed and asks for the opposite on a click", () => {
        const onPressedChange = vi.fn();
        render(
            <ToggleChip pressed={false} onPressedChange={onPressedChange}>
                Archived
            </ToggleChip>,
        );

        const chip = screen.getByRole("button", { name: "Archived" });
        expect(chip.getAttribute("aria-pressed")).toBe("false");
        expect(chip.getAttribute("type")).toBe("button");
        fireEvent.click(chip);
        expect(onPressedChange).toHaveBeenCalledWith(true);
    });

    it("keeps the state the app gives it", () => {
        render(
            <ToggleChip pressed onPressedChange={() => undefined}>
                Archived
            </ToggleChip>,
        );

        const chip = screen.getByRole("button", { name: "Archived" });
        fireEvent.click(chip);
        expect(chip.getAttribute("aria-pressed")).toBe("true");
    });
});

describe("ChipFilter", () => {
    it("is a group named by its label with one pressed chip per chosen option", () => {
        render(<Statuses initial={["open"]} />);

        const group = screen.getByRole("group", { name: "Status" });
        expect(group.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
        expect(screen.getByRole("button", { name: "Open" }).getAttribute("aria-pressed")).toBe("true");
    });

    it("toggles chips into a value in the order of the options and counts them", () => {
        const onValueChange = vi.fn();
        render(<Statuses initial={[]} onValueChange={onValueChange} />);

        expect(screen.queryByText("0 selected")).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Done" }));
        fireEvent.click(screen.getByRole("button", { name: "Draft" }));

        expect(onValueChange).toHaveBeenLastCalledWith(["draft", "done"]);
        expect(screen.getByText("2 selected")).toBeDefined();
    });

    it("clears every chip at once and hands the focus to the first chip", () => {
        const onValueChange = vi.fn();
        render(<Statuses initial={["draft", "done"]} onValueChange={onValueChange} />);

        fireEvent.click(screen.getByRole("button", { name: "Clear" }));

        expect(onValueChange).toHaveBeenLastCalledWith([]);
        expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "Draft" }));
    });

    it("takes its words from props, for an app not in English", () => {
        render(
            <ChipFilter
                label="Stan"
                options={statuses}
                value={["open"]}
                onValueChange={() => undefined}
                clearLabel="Wyczyść"
                countLabel={(count) => `wybrano ${count}`}
            />,
        );

        expect(screen.getByRole("button", { name: "Wyczyść" })).toBeDefined();
        expect(screen.getByText("wybrano 1")).toBeDefined();
    });
});
