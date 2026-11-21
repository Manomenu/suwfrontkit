import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { LinkProvider } from "../leaveGuard/LinkProvider.js";
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

it("inside a LinkProvider moves to a path of the app with the app's navigate, and leaves another address to the browser", () => {
    const navigate = vi.fn();
    render(
        <LinkProvider navigate={navigate}>
            <Anchor href="/companies/ASML">ASML</Anchor>
            <Anchor href="https://example.com/report">Report</Anchor>
            <Anchor href="#notes">Notes</Anchor>
        </LinkProvider>,
    );

    expect(fireEvent.click(screen.getByRole("link", { name: "ASML" }))).toBe(false);
    expect(navigate).toHaveBeenCalledWith("/companies/ASML");
    expect(fireEvent.click(screen.getByRole("link", { name: "Report" }))).toBe(true);
    expect(fireEvent.click(screen.getByRole("link", { name: "Notes" }))).toBe(true);
    expect(navigate).toHaveBeenCalledTimes(1);
});

it("without a LinkProvider is a plain link", () => {
    render(<Anchor href="/companies/ASML">ASML</Anchor>);

    expect(fireEvent.click(screen.getByRole("link", { name: "ASML" }))).toBe(true);
});
