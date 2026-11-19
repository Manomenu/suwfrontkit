import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Select } from "./Select.js";

it("is the native select with its options", () => {
    render(
        <Select aria-label="Currency" defaultValue="eur">
            <option value="pln">PLN</option>
            <option value="eur">EUR</option>
        </Select>,
    );

    expect(screen.getByRole<HTMLSelectElement>("combobox", { name: "Currency" }).value).toBe("eur");
});
