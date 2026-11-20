import { describe, expect, it } from "vitest";

import { isAlone, pageOf } from "./pageOf.js";

const all = Array.from({ length: 45 }, (_, index) => index + 1);

describe("pageOf, the whole list given", () => {
    it("cuts the page out of the list and counts the pages", () => {
        expect(pageOf(all, 2, 20, {})).toEqual({ entries: all.slice(20, 40), page: 2, pages: 3 });
        expect(pageOf(all, 3, 20, {}).entries).toEqual([41, 42, 43, 44, 45]);
    });

    it("keeps the page inside the list when the list shrinks or the page is out of range", () => {
        expect(pageOf(all.slice(0, 10), 3, 20, {})).toMatchObject({ page: 1, pages: 1, entries: all.slice(0, 10) });
        expect(pageOf(all, 0, 20, {}).page).toBe(1);
        expect(pageOf([], 1, 20, {})).toEqual({ entries: [], page: 1, pages: 1 });
    });
});

describe("pageOf, one page from the server", () => {
    it("shows the entries as given and counts the pages from the total", () => {
        expect(pageOf(all.slice(0, 20), 2, 20, { total: 45 })).toEqual({ entries: all.slice(0, 20), page: 2, pages: 3 });
        expect(pageOf([], 1, 20, { total: 0 })).toEqual({ entries: [], page: 1, pages: 1 });
    });

    it("with no total, offers one more page while the server says there is a next one", () => {
        expect(pageOf(all.slice(0, 20), 4, 20, { hasNext: true })).toEqual({ entries: all.slice(0, 20), page: 4, pages: 5, hasNext: true });
        expect(pageOf(all.slice(0, 5), 5, 20, { hasNext: false })).toMatchObject({ page: 5, pages: 5, hasNext: false });
    });
});

it("a page is alone when there is no page before it and none after it", () => {
    expect(isAlone(pageOf(all.slice(0, 20), 1, 20, {}))).toBe(true);
    expect(isAlone(pageOf(all, 1, 20, {}))).toBe(false);
    expect(isAlone(pageOf(all.slice(0, 20), 1, 20, { total: 20 }))).toBe(true);
    expect(isAlone(pageOf(all.slice(0, 20), 1, 20, { hasNext: false }))).toBe(true);
    expect(isAlone(pageOf(all.slice(0, 20), 1, 20, { hasNext: true }))).toBe(false);
    expect(isAlone(pageOf([], 2, 20, { hasNext: false }))).toBe(false);
});
