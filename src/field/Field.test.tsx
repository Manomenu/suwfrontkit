import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Field, Legend } from "./Field.js";

it("ties the control to its label and to the mistakes beneath it", () => {
    render(
        <Field prefix="thesis" name="target" label="Target" hint="The price at which it is fulfilled." errors={["Write a number."]}>
            {(props) => <input {...props} />}
        </Field>,
    );

    const input = screen.getByRole("textbox", { name: "Target" });
    expect(input.id).toBe("thesis-target");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(input.getAttribute("aria-describedby") ?? "")?.textContent).toBe("Write a number.");
    expect(screen.getByRole("button", { name: "About Target" })).toBeDefined();
});

it("without mistakes marks nothing invalid", () => {
    render(
        <Field prefix="thesis" name="title" label="Title" labelHidden errors={[]}>
            {(props) => <input {...props} />}
        </Field>,
    );

    const input = screen.getByRole("textbox", { name: "Title" });
    expect(input.hasAttribute("aria-invalid")).toBe(false);
    expect(input.hasAttribute("aria-describedby")).toBe(false);
});

it("a legend names its group and carries its help", () => {
    render(
        <fieldset>
            <Legend hint="Which markets the screen shows.">Markets</Legend>
        </fieldset>,
    );

    expect(screen.getByRole("group", { name: /Markets/ })).toBeDefined();
    expect(screen.getByRole("button", { name: "About Markets" })).toBeDefined();
});
