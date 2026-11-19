import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Textarea } from "./Textarea.js";

it("is a monospace text area", () => {
    render(<Textarea aria-label="Note" />);

    expect(screen.getByRole("textbox", { name: "Note" }).className).toContain("font-mono");
});
