import { afterEach, beforeEach, expect, it } from "vitest";

import { formatDate, formatDateTime, formatTime } from "./time.js";

const zone = process.env["TZ"];

beforeEach(() => {
    process.env["TZ"] = "Pacific/Auckland";
});

afterEach(() => {
    process.env["TZ"] = zone;
});

it("writes a moment in the computer's own time zone, not in UTC, year first and on a 24-hour clock", () => {
    const moment = "2026-11-17T15:41:44.77Z";

    expect(formatDateTime(moment)).toBe("2026-11-18 04:41");
    expect(formatDate(moment)).toBe("2026-11-18");
    expect(formatTime(moment)).toBe("04:41");
    expect(formatDateTime(new Date(moment))).toBe("2026-11-18 04:41");
});

it("writes midnight as 00, not 24", () => {
    expect(formatTime("2026-06-30T12:05:00Z")).toBe("00:05");
});

it("is a dash for no moment or one that is not a date", () => {
    for (const moment of [null, undefined, "", "yesterday"]) {
        expect(formatDateTime(moment)).toBe("—");
        expect(formatDate(moment)).toBe("—");
        expect(formatTime(moment)).toBe("—");
    }
});
