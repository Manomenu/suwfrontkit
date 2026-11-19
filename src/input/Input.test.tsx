import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Input } from "./Input.js";

it("passes its attributes on and lets the caller's classes win", () => {
    render(<Input aria-label="Ticker" aria-invalid className="w-40" />);

    const input = screen.getByRole("textbox", { name: "Ticker" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.className).toContain("w-40");
    expect(input.className).not.toContain("w-full");
});
