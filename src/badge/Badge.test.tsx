import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Badge } from "./Badge.js";

it("is neutral by default and takes the info colours when asked", () => {
    render(
        <>
            <Badge>Draft</Badge>
            <Badge variant="info">New</Badge>
        </>,
    );

    expect(screen.getByText("Draft").className).toContain("bg-secondary");
    expect(screen.getByText("New").className).toContain("bg-info-light");
});
