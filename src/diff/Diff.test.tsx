import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Diff, DiffLines } from "./Diff.js";

const before = Array.from({ length: 12 }, (_, index) => `line ${String(index + 1)}`).join("\n");
const after = before.replace("line 6", "line six").replace("line 12", "line 12\nline 13");

function changes(container: HTMLElement): string[] {
    return [...container.querySelectorAll("tr[data-change]")].map((row) => `${row.getAttribute("data-change") ?? ""} ${row.textContent}`);
}

it("marks removed and added lines and says so to a screen reader, not by colour alone", () => {
    const { container } = render(<Diff before={"a\nb\n"} after={"a\nc\n"} />);

    expect(changes(container)).toEqual(["same 11 a", "removed 2−Removed: b", "added 2+Added: c"]);
    expect(container.querySelector('tr[data-change="added"]')?.className).toContain("bg-success-light");
    expect(container.querySelector('tr[data-change="removed"]')?.className).toContain("bg-destructive-light");
});

it("folds long unchanged runs behind a button that shows them", () => {
    const { container } = render(<Diff before={before} after={after} context={1} />);

    expect(changes(container).map((row) => row.split(" ")[0])).toEqual(["same", "removed", "added", "same", "same", "added"]);
    expect(screen.queryByText("line 1")).toBeNull();
    const [top, bottom] = screen.getAllByRole("button", { name: "Show 4 unchanged lines" });
    if (top === undefined || bottom === undefined) throw new Error("two folded runs expected");
    fireEvent.click(top);

    expect(screen.getByText("line 1")).toBeDefined();
    expect(screen.queryByText("line 9")).toBeNull();
    expect(screen.getAllByRole("button", { name: "Show 4 unchanged lines" })).toEqual([bottom]);
});

it("side by side, puts the old text on the left and the new on the right under their headings", () => {
    const { container } = render(
        <Diff before={"a\nb\n"} after={"a\nc\nd\n"} view="split" labels={{ before: "Version 3", after: "Version 4" }} />,
    );

    expect(screen.getAllByRole("columnheader").map((header) => header.textContent)).toEqual(["Version 3", "Version 4"]);
    const rows = [...container.querySelectorAll("tbody tr")].map((row) => [...row.querySelectorAll("td")].map((cell) => cell.textContent));
    expect(rows).toEqual([
        ["1", "a", "1", "a"],
        ["2", "Removed: b", "2", "Added: c"],
        ["", "", "3", "Added: d"],
    ]);
});

it("says the texts are identical instead of drawing an empty table, in the words the app gives", () => {
    render(<Diff before="same" after="same" labels={{ identical: "Bez zmian." }} />);

    expect(screen.getByText("Bez zmian.")).toBeDefined();
    expect(screen.queryByRole("table")).toBeNull();
});

it("draws lines the server already compared, with what it folded as a plain line", () => {
    const { container } = render(
        <DiffLines
            lines={[
                { change: "removed", text: "Wycena domu: 900 zł" },
                { change: "added", text: "Wycena domu: 1100 zł" },
                { change: "folded", text: "8 unchanged lines" },
                { change: "same", text: "Kontakt: biuro@example.com" },
            ]}
        />,
    );

    expect(changes(container)).toEqual([
        "removed −Removed: Wycena domu: 900 zł",
        "added +Added: Wycena domu: 1100 zł",
        "same  Kontakt: biuro@example.com",
    ]);
    expect(screen.getByText("8 unchanged lines").tagName).toBe("TD");
    expect(container.querySelector('tr[data-change="added"]')?.className).toContain("bg-success-light");
});
