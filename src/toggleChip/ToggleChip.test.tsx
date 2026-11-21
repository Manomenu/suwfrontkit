import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ToggleChip } from "./ToggleChip.js";

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

    it("shows its help on focus", async () => {
        render(
            <ToggleChip pressed={false} onPressedChange={() => undefined} help="Hide the rows that are the same in every run.">
                Only rows that differ
            </ToggleChip>,
        );

        fireEvent.focus(screen.getByRole("button", { name: "Only rows that differ" }));
        expect((await screen.findByRole("tooltip")).textContent).toBe("Hide the rows that are the same in every run.");
    });
});
