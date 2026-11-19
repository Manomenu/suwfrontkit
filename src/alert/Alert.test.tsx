import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Alert } from "./Alert.js";

it("is announced as an alert", () => {
    render(<Alert variant="destructive">The name is taken.</Alert>);

    expect(screen.getByRole("alert").textContent).toBe("The name is taken.");
    expect(screen.getByRole("alert").className).toContain("bg-destructive-light");
});
