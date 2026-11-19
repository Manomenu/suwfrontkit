import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Table } from "./Table.js";

it("scrolls sideways inside its own box when it is wider than the page", () => {
    render(
        <Table>
            <tbody>
                <tr>
                    <td>ASML</td>
                </tr>
            </tbody>
        </Table>,
    );

    expect(screen.getByRole("table").parentElement?.className).toContain("overflow-x-auto");
});
