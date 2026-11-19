import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { History, type HistoryEntry } from "./History.js";

const entries: HistoryEntry[] = [
    { id: "3", at: "2026-11-19T14:05:00Z", who: "Anna", what: "edited the article Prices", details: <p>Title: Prices → Price list</p> },
    { id: "2", at: new Date("2026-11-18T09:30:00Z"), who: "Bot", what: "published version 4" },
];

const many: HistoryEntry[] = Array.from({ length: 45 }, (_, index) => ({
    id: String(index + 1),
    at: "2026-11-19T14:05:00Z",
    who: "Anna",
    what: `change ${String(index + 1)}`,
}));

const whats = () =>
    within(screen.getByRole("list", { name: "History" }))
        .getAllByRole("listitem")
        .map((item) => item.textContent.replace(/^.*Anna/, ""));

beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
});

it("lists who did what and when, in the order the app gives, with the moment as a machine-readable time", () => {
    render(<History entries={entries} locale="en-GB" timeZone="UTC" />);

    const items = within(screen.getByRole("list", { name: "History" })).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
        "19 Nov 2026, 14:05Annaedited the article PricesDetailsTitle: Prices → Price list",
        "18 Nov 2026, 09:30Botpublished version 4",
    ]);
    expect(items[0]?.querySelector("time")?.getAttribute("datetime")).toBe("2026-11-19T14:05:00.000Z");
});

it("formats the moment with Intl in the app's locale and time zone", () => {
    render(<History entries={entries.slice(1)} locale="pl-PL" timeZone="Europe/Warsaw" />);

    expect(screen.getByText("18 lis 2026, 10:30")).toBeDefined();
});

it("folds the details of an entry and gives each entry the action the app passes", () => {
    const onShow = vi.fn<(id: string) => void>();
    render(
        <History
            entries={entries.map((entry) => ({
                ...entry,
                actions: (
                    <button
                        type="button"
                        onClick={() => {
                            onShow(entry.id);
                        }}
                    >
                        Show the diff
                    </button>
                ),
            }))}
            locale="en-GB"
            timeZone="UTC"
        />,
    );

    expect(screen.getByText("Details").closest("details")?.open).toBe(false);
    fireEvent.click(screen.getAllByRole("button", { name: "Show the diff" })[1] ?? document.body);

    expect(onShow).toHaveBeenCalledWith("2");
});

it("with no entries says so in the words the app gives, and names the list in them too", () => {
    const { rerender } = render(<History entries={[]} labels={{ empty: "Brak zmian." }} />);
    expect(screen.getByText("Brak zmian.")).toBeDefined();
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.queryByRole("group", { name: "Pages" })).toBeNull();

    rerender(<History entries={entries} labels={{ list: "Historia", details: "Szczegóły" }} locale="pl-PL" timeZone="UTC" />);
    expect(screen.getByRole("list", { name: "Historia" })).toBeDefined();
    expect(screen.getByText("Szczegóły")).toBeDefined();
});

it("draws no pagination at all when every entry fits on one page", () => {
    render(<History entries={many.slice(0, 20)} />);

    expect(screen.queryByRole("group", { hidden: true })).toBeNull();
    expect(whats()).toHaveLength(20);
});

it("given the whole list, pages through it by itself, a page size the app chooses", () => {
    render(<History entries={many} pageSize={10} />);

    expect(whats()).toEqual(many.slice(0, 10).map((entry) => entry.what));
    expect(screen.getByText("Page 1 of 5")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(whats()[0]).toBe("change 11");
    expect(screen.getByText("Page 2 of 5")).toBeDefined();
});

it("controlled, shows the page the app holds and asks the app to move", () => {
    const onPageChange = vi.fn<(page: number) => void>();
    render(<History entries={many} page={3} onPageChange={onPageChange} />);

    expect(whats()).toEqual(many.slice(40).map((entry) => entry.what));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));

    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(whats()[0]).toBe("change 41");
});

it("given one page from the server and the total, shows those entries and counts the pages from the total", () => {
    const onPageChange = vi.fn<(page: number) => void>();
    render(<History entries={many.slice(20, 40)} total={45} page={2} onPageChange={onPageChange} labels={{ next: "Dalej" }} />);

    expect(whats()).toEqual(many.slice(20, 40).map((entry) => entry.what));
    expect(screen.getByText("Page 2 of 3")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Dalej" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
});

it("with an unknown total, offers the next page only while the server says there is one", () => {
    const { rerender } = render(<History entries={many.slice(0, 20)} hasNext page={1} onPageChange={() => undefined} />);
    expect(screen.getByText("Page 1")).toBeDefined();
    expect(screen.getByRole("button", { name: "Next" }).hasAttribute("disabled")).toBe(false);

    rerender(<History entries={many.slice(0, 20)} hasNext={false} page={1} onPageChange={() => undefined} />);
    expect(screen.queryByRole("group", { hidden: true })).toBeNull();
});

it("a server page past the end says it is empty and still lets the reader go back", () => {
    const onPageChange = vi.fn<(page: number) => void>();
    render(<History entries={[]} total={20} page={2} onPageChange={onPageChange} />);

    expect(screen.getByText("No change has been recorded yet.")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
});

it("shows the loading line and the failure of a server page in place of the entries", () => {
    const { rerender } = render(<History entries={[]} total={45} page={2} loading labels={{ loading: "Wczytuję…" }} />);
    expect(screen.getByText("Wczytuję…")).toBeDefined();

    rerender(<History entries={[]} total={45} page={2} failure="The history could not be loaded." />);
    expect(screen.getByRole("alert").textContent).toBe("The history could not be loaded.");
});
