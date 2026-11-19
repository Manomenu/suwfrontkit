import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Label } from "./Label.js";

it("names the control it points at", () => {
    render(
        <>
            <Label htmlFor="name">Name</Label>
            <input id="name" />
        </>,
    );

    expect(screen.getByRole("textbox", { name: "Name" })).toBeDefined();
});
