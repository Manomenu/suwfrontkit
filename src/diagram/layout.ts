export interface Placed {
    id: string;
    row: number;
    column: number;
    tall: boolean;
}

export interface Joined {
    from: string;
    to: string;
    kind?: "flow" | "data";
}

export interface Box {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Layout {
    boxes: Box[];
    width: number;
    height: number;
}

export const NODE_WIDTH = 240;
const NODE_HEIGHT = 56;
export const TALL_NODE_HEIGHT = 84;
const NODE_GAP = 32;
const ROW_GAP = 60;
const PADDING = 12;

const total = (values: number[]) => values.reduce((sum, value) => sum + value, 0);

function inDiagramOrder(one: Placed, other: Placed): number {
    return one.row - other.row || one.column - other.column || one.id.localeCompare(other.id);
}

function flowParents(edges: Joined[]): Map<string, Set<string>> {
    const parents = new Map<string, Set<string>>();
    for (const edge of edges) {
        if (edge.kind !== "data") parents.set(edge.to, (parents.get(edge.to) ?? new Set<string>()).add(edge.from));
    }
    return parents;
}

function wantedCentre(node: Placed, ordered: Placed[], parents: Map<string, Set<string>>, centres: Map<string, number>): number {
    const above = ordered.flatMap((other) => {
        const centre = centres.get(other.id);
        return other.row < node.row && centre !== undefined && parents.get(node.id)?.has(other.id) === true ? [centre] : [];
    });
    return above.length === 0 ? 0 : Math.round(total(above) / above.length);
}

function spreadRow(wanted: number[]): number[] {
    const packed: number[] = [];
    for (const centre of wanted) {
        const previous = packed.at(-1);
        packed.push(previous === undefined ? centre : Math.max(centre, previous + NODE_WIDTH + NODE_GAP));
    }
    const shift = Math.round((total(wanted) - total(packed)) / Math.max(1, packed.length));
    return packed.map((centre) => centre + shift);
}

export function layoutDiagram(nodes: Placed[], edges: Joined[]): Layout {
    const heightOf = (node: Placed) => (node.tall ? TALL_NODE_HEIGHT : NODE_HEIGHT);
    const ordered = [...nodes].sort(inDiagramOrder);
    const parents = flowParents(edges);
    const centres = new Map<string, number>();
    const boxes: Box[] = [];
    let rowTop = 0;
    for (const row of new Set(ordered.map((node) => node.row))) {
        const members = ordered.filter((node) => node.row === row);
        const spread = spreadRow(members.map((node) => wantedCentre(node, ordered, parents, centres)));
        const rowHeight = Math.max(...members.map(heightOf));
        members.forEach((node, index) => {
            const centre = spread[index] ?? 0;
            const height = heightOf(node);
            centres.set(node.id, centre);
            boxes.push({ id: node.id, x: centre - NODE_WIDTH / 2, y: rowTop + (rowHeight - height) / 2, width: NODE_WIDTH, height });
        });
        rowTop += rowHeight + ROW_GAP;
    }
    const left = Math.min(0, ...boxes.map((box) => box.x));
    const top = Math.min(0, ...boxes.map((box) => box.y));
    const right = Math.max(0, ...boxes.map((box) => box.x + box.width));
    const bottom = Math.max(0, ...boxes.map((box) => box.y + box.height));
    return {
        boxes: boxes.map((box) => ({ ...box, x: box.x - left + PADDING, y: box.y - top + PADDING })),
        width: right - left + 2 * PADDING,
        height: bottom - top + 2 * PADDING,
    };
}

const SCROLL_MARGIN = 12;

export function scrolledToShow(start: number, size: number, scrolled: number, visible: number): number {
    if (start < scrolled) return Math.max(0, start - SCROLL_MARGIN);
    if (start + size > scrolled + visible) return start + size - visible + SCROLL_MARGIN;
    return scrolled;
}
