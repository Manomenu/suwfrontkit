import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Spinner } from "./Spinner.js";

it("is a status named after what is loading", () => {
    render(<Spinner label="Loading the charts" />);

    expect(screen.getByRole("status", { name: "Loading the charts" })).toBeTruthy();
});
