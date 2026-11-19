import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Anchor } from "./Anchor.js";

it("is a link in the anchor colour, also around a router's link", () => {
    render(
        <>
            <Anchor href="/a">Plain</Anchor>
            <Anchor asChild>
                <a href="/b">Routed</a>
            </Anchor>
        </>,
    );

    expect(screen.getByRole("link", { name: "Plain" }).className).toContain("text-anchor");
    expect(screen.getByRole("link", { name: "Routed" }).className).toContain("text-anchor");
});
