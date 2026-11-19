import { expect, it } from "vitest";

import { cn } from "./classNames.js";

it("lets the later Tailwind utility win and drops falsy values", () => {
    expect(cn("px-2 text-sm", false, undefined, "px-4")).toBe("text-sm px-4");
});
