import { describe, expect, it } from "vitest";

import { layoutDiagram, NODE_WIDTH, scrolledToShow, TALL_NODE_HEIGHT, type Joined, type Placed } from "./layout.js";

const BRANCHY: Placed[] = [
    { id: "start", row: 0, column: 0, tall: false },
    { id: "ask", row: 1, column: 0, tall: false },
    { id: "first", row: 2, column: 0, tall: false },
    { id: "double", row: 3, column: 0, tall: false },
    { id: "other", row: 2, column: 1, tall: false },
    { id: "use", row: 4, column: 0, tall: true },
];

const BRANCHY_EDGES: Joined[] = [
    { from: "start", to: "ask" },
    { from: "ask", to: "first" },
    { from: "ask", to: "other" },
    { from: "first", to: "double" },
    { from: "double", to: "use" },
    { from: "other", to: "use" },
    { from: "double", to: "use", kind: "data" },
    { from: "start", to: "use", kind: "data" },
    { from: "use", to: "start" },
];

const positions = (layout: ReturnType<typeof layoutDiagram>) =>
    [...layout.boxes].sort((one, other) => one.id.localeCompare(other.id)).map((box) => [box.id, box.x, box.y]);

describe("layoutDiagram", () => {
    it("lays the rows top to bottom and the columns of a row side by side, without overlap", () => {
        const layout = layoutDiagram(BRANCHY, BRANCHY_EDGES);
        const at = (id: string) => layout.boxes.find((box) => box.id === id) ?? { x: Number.NaN, y: Number.NaN, height: 0 };
        const bands = [...new Set(layout.boxes.map((box) => box.y))].sort((one, other) => one - other);

        expect(BRANCHY.map((node) => [node.id, bands.indexOf(at(node.id).y)])).toEqual(BRANCHY.map((node) => [node.id, node.row]));
        expect(at("first").y).toBe(at("other").y);
        expect(at("other").x - at("first").x).toBeGreaterThanOrEqual(NODE_WIDTH);
        expect(at("use").height).toBe(TALL_NODE_HEIGHT);
    });

    it("centres a node under the nodes it follows and fits every box inside the drawing", () => {
        const layout = layoutDiagram(BRANCHY, BRANCHY_EDGES);
        const centre = (id: string) => {
            const box = layout.boxes.find((one) => one.id === id);
            return box === undefined ? Number.NaN : box.x + box.width / 2;
        };

        expect(centre("ask")).toBe(centre("start"));
        expect(centre("ask")).toBe((centre("first") + centre("other")) / 2);
        for (const box of layout.boxes) {
            expect(box.x).toBeGreaterThan(0);
            expect(box.y).toBeGreaterThan(0);
            expect(box.x + box.width).toBeLessThan(layout.width);
            expect(box.y + box.height).toBeLessThan(layout.height);
        }
    });

    it("draws the same whatever the order of the nodes and the edges", () => {
        const shuffled = [...BRANCHY_EDGES.slice(4), ...BRANCHY_EDGES.slice(0, 4)].reverse();

        expect(positions(layoutDiagram([...BRANCHY].reverse(), shuffled))).toEqual(positions(layoutDiagram(BRANCHY, BRANCHY_EDGES)));
    });
});

describe("scrolledToShow", () => {
    it("keeps the scroll when the box is in view, and moves it just enough when it is not", () => {
        expect(scrolledToShow(100, 50, 0, 300)).toBe(0);
        expect(scrolledToShow(400, 50, 0, 300)).toBe(162);
        expect(scrolledToShow(20, 50, 100, 300)).toBe(8);
    });
});
