import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Spinner } from "./Spinner.js";

it("is a status named after what is loading, and says it on the screen", () => {
    render(<Spinner label="Loading the charts" />);

    const status = screen.getByRole("status", { name: "Loading the charts" });
    expect(status.textContent).toBe("Loading the charts");
});
