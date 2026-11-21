import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { SegmentedControl } from "./SegmentedControl.js";

const OPTIONS = [
    { value: "median", label: "Median" },
    { value: "p95", label: "95th percentile" },
] as const;

it("is a radio group named by its label, with the value checked", () => {
    render(<SegmentedControl label="Turn time" options={OPTIONS} value="p95" onValueChange={vi.fn()} />);

    expect(screen.getByRole("radiogroup", { name: "Turn time" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "95th percentile" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "Median" }).getAttribute("aria-checked")).toBe("false");
});

it("gives back the option clicked, and never an empty choice when the checked one is clicked again", () => {
    const onValueChange = vi.fn();
    render(<SegmentedControl label="Turn time" options={OPTIONS} value="median" onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("radio", { name: "95th percentile" }));
    fireEvent.click(screen.getByRole("radio", { name: "Median" }));

    expect(onValueChange.mock.calls).toEqual([["p95"]]);
});
