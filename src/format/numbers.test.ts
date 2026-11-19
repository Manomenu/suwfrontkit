import { expect, it } from "vitest";

import { formatPercent, formatSeconds } from "./numbers.js";

it("writes a share as a percent with at most one decimal", () => {
    expect(formatPercent(1)).toBe("100%");
    expect(formatPercent(0.5)).toBe("50%");
    expect(formatPercent(0.6667)).toBe("66.7%");
    expect(formatPercent(12.5)).toBe("1,250%");
});

it("writes milliseconds as seconds with one decimal, rounding half up", () => {
    expect(formatSeconds(9800)).toBe("9.8 s");
    expect(formatSeconds(1250)).toBe("1.3 s");
    expect(formatSeconds(109_050)).toBe("109.1 s");
    expect(formatSeconds(0)).toBe("0.0 s");
});

it("is a dash for no number", () => {
    for (const amount of [null, undefined, Number.NaN, Number.POSITIVE_INFINITY]) {
        expect(formatPercent(amount)).toBe("—");
        expect(formatSeconds(amount)).toBe("—");
    }
});
