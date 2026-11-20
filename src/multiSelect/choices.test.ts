import { describe, expect, it } from "vitest";

import { choicesWith, matching, stepped, toggled } from "./choices.js";

const options = [
    { value: "billing", label: "Billing" },
    { value: "procedure", label: "Procedure" },
    { value: "smoke", label: "Smoke test" },
];

describe("choicesWith", () => {
    it("offers every option and, after them, each chosen value that is no longer offered, named by itself", () => {
        expect(choicesWith(options, ["gone", "smoke", "gone"])).toEqual([...options, { value: "gone", label: "gone" }]);
    });
});

describe("matching", () => {
    it("keeps the choices whose label holds the query, ignoring case and the spaces around it", () => {
        expect(matching(options, "  TEST ")).toEqual([options[2]]);
        expect(matching(options, "")).toEqual(options);
        expect(matching(options, "nothing")).toEqual([]);
    });
});

describe("toggled", () => {
    it("adds or removes a choice and gives the value back in the order of the choices, keeping values no longer offered", () => {
        const choices = choicesWith(options, ["gone"]);
        expect(toggled(choices, ["gone", "smoke"], "billing")).toEqual(["billing", "smoke", "gone"]);
        expect(toggled(choices, ["billing", "gone"], "billing")).toEqual(["gone"]);
    });
});

describe("stepped", () => {
    it("starts at the first choice going down and at the last going up", () => {
        expect(stepped(options, null, 1)).toBe("billing");
        expect(stepped(options, null, -1)).toBe("smoke");
    });

    it("moves one choice and wraps around the ends", () => {
        expect(stepped(options, "billing", 1)).toBe("procedure");
        expect(stepped(options, "smoke", 1)).toBe("billing");
        expect(stepped(options, "billing", -1)).toBe("smoke");
    });

    it("has nothing to move to when nothing is shown", () => {
        expect(stepped([], "billing", 1)).toBeNull();
    });
});
