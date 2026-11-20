import { describe, expect, it } from "vitest";

import { chosenOf, toggled } from "./selection.js";

const options = ["draft", "open", "done"];

describe("toggled", () => {
    it("adds an option that was off and gives the value back in the order of the options", () => {
        expect(toggled(options, ["done"], "draft")).toEqual(["draft", "done"]);
    });

    it("removes an option that was on", () => {
        expect(toggled(options, ["draft", "done"], "done")).toEqual(["draft"]);
    });

    it("drops a value no chip shows, so the filter is exactly what the chips show", () => {
        expect(toggled(options, ["archived", "open"], "draft")).toEqual(["draft", "open"]);
    });
});

describe("chosenOf", () => {
    it("counts only the options that are on, each once", () => {
        expect(chosenOf(options, ["open", "gone", "open"])).toEqual(["open"]);
        expect(chosenOf(options, [])).toEqual([]);
    });
});
