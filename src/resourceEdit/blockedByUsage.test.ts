import { expect, it } from "vitest";

import { blockedByUsage } from "./blockedByUsage.js";

it("blocks a deletion only while something uses the resource, and says how many places to change", () => {
    expect(blockedByUsage(0)).toBeNull();
    expect(blockedByUsage(1)).toBe("Used in 1 place. Remove that reference first.");
    expect(blockedByUsage(3)).toBe("Used in 3 places. Remove those references first.");
});
