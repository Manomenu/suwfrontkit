import { MarkerType, type Edge } from "@xyflow/react";

export interface DiagramEdge {
    from: string;
    to: string;
    label?: string;
    kind?: "flow" | "data";
}

export function linesOf(edges: DiagramEdge[]): Edge[] {
    return edges.map((edge, index): Edge => {
        const data = edge.kind === "data";
        return {
            id: `${edge.kind ?? "flow"}-${String(index)}-${edge.from}-${edge.to}`,
            source: edge.from,
            target: edge.to,
            type: edge.label === undefined ? "smoothstep" : "labelled",
            markerEnd: { type: MarkerType.ArrowClosed },
            ...(edge.label === undefined ? {} : { label: edge.label, data: { near: data ? "target" : "source" } }),
            ...(data ? { style: { strokeDasharray: "6 4" }, className: "opacity-70" } : {}),
        };
    });
}
