import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    Handle,
    Position,
    ReactFlow,
    type Edge,
    type EdgeProps,
    type Node,
    type NodeProps,
} from "@xyflow/react";

import { cn } from "../classNames.js";
import { layoutDiagram, scrolledToShow, type Box } from "./layout.js";
import { linesOf, type DiagramEdge } from "./lines.js";

export interface DiagramNode {
    id: string;
    name: string;
    row: number;
    column: number;
    icon?: ReactNode;
    marks?: ReactNode;
    details?: ReactNode;
    muted?: boolean;
}

type StepNode = Node<{ step: DiagramNode; selected: boolean; onOpen: ((id: string) => void) | undefined }, "step">;

function StepBox({ data }: NodeProps<StepNode>) {
    const { step, selected, onOpen } = data;
    const classes = cn(
        "flex h-full w-full flex-col justify-center gap-1 rounded-lg border bg-card px-3 py-1.5 text-left text-sm text-card-foreground",
        selected ? "border-primary ring-2 ring-primary/50" : "border-border",
        step.muted === true && "opacity-60",
        onOpen !== undefined &&
            "pointer-events-auto cursor-pointer hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    );
    const content = (
        <>
            <span className="flex min-w-0 items-center gap-1.5">
                {step.icon !== undefined && <span aria-hidden="true">{step.icon}</span>}
                <span className="line-clamp-2 min-w-0 flex-1 leading-5 font-medium wrap-break-word" title={step.name}>
                    {step.name}
                </span>
                {step.marks}
            </span>
            {step.details !== undefined && <span className="flex items-center gap-2">{step.details}</span>}
        </>
    );
    return (
        <div className="h-full w-full" data-step={step.id} data-selected={selected}>
            <Handle type="target" position={Position.Top} isConnectable={false} className="opacity-0" />
            {onOpen === undefined ? (
                <div className={classes}>{content}</div>
            ) : (
                <button
                    type="button"
                    className={classes}
                    aria-current={selected ? "true" : undefined}
                    onClick={() => {
                        onOpen(step.id);
                    }}
                >
                    {content}
                </button>
            )}
            <Handle type="source" position={Position.Bottom} isConnectable={false} className="opacity-0" />
        </div>
    );
}

const LABEL_OFFSET = 14;

type LabelledEdgeType = Edge<{ near: "source" | "target" }, "labelled">;

function LabelledEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    style,
    label,
    data,
}: EdgeProps<LabelledEdgeType>) {
    const [path, labelX] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
    const labelY = data?.near === "target" ? targetY - LABEL_OFFSET : sourceY + LABEL_OFFSET;
    return (
        <>
            <BaseEdge id={id} path={path} {...(markerEnd === undefined ? {} : { markerEnd })} {...(style === undefined ? {} : { style })} />
            <EdgeLabelRenderer>
                <div
                    data-edge-label
                    className="pointer-events-auto absolute rounded bg-background px-1.5 py-0.5 text-xs text-foreground"
                    style={{ transform: `translate(-50%, -50%) translate(${String(labelX)}px, ${String(labelY)}px)` }}
                >
                    {label}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

const NODE_TYPES = { step: StepBox };
const EDGE_TYPES = { labelled: LabelledEdge };
const FIXED_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const PANE_STYLE: CSSProperties = { backgroundColor: "transparent" };

function stepsOf(nodes: DiagramNode[], boxes: Box[], selectedId: string | null | undefined, onOpen: ((id: string) => void) | undefined) {
    const byId = new Map(nodes.map((node) => [node.id, node]));
    return boxes.flatMap((box): StepNode[] => {
        const step = byId.get(box.id);
        if (step === undefined) return [];
        return [
            {
                id: box.id,
                type: "step",
                position: { x: box.x, y: box.y },
                width: box.width,
                height: box.height,
                data: { step, selected: box.id === selectedId, onOpen },
            },
        ];
    });
}

export function FlowDiagram({
    nodes,
    edges,
    label,
    onNodeClick,
    selectedId,
    focusId,
    focusRequest = 0,
    className,
}: {
    nodes: DiagramNode[];
    edges: DiagramEdge[];
    label: string;
    onNodeClick?: (id: string) => void;
    selectedId?: string | null;
    focusId?: string;
    focusRequest?: number;
    className?: string;
}) {
    const layout = useMemo(
        () =>
            layoutDiagram(
                nodes.map((node) => ({ ...node, tall: node.details !== undefined })),
                edges,
            ),
        [nodes, edges],
    );
    const steps = useMemo(() => stepsOf(nodes, layout.boxes, selectedId, onNodeClick), [nodes, layout, selectedId, onNodeClick]);
    const lines = useMemo(() => linesOf(edges), [edges]);
    const frame = useRef<HTMLDivElement>(null);
    const focused = layout.boxes.find((box) => box.id === focusId);
    useEffect(() => {
        const shown = frame.current;
        if (shown === null || focused === undefined) return;
        shown.scrollLeft = scrolledToShow(focused.x, focused.width, shown.scrollLeft, shown.clientWidth);
        shown.scrollTop = Math.max(0, focused.y + focused.height / 2 - shown.clientHeight / 2);
    }, [focused, focusRequest]);
    return (
        <div
            ref={frame}
            role="figure"
            aria-label={label}
            className={cn("min-h-0 w-full flex-1 overflow-auto rounded-lg border border-border", className)}
        >
            <div className="mx-auto" style={{ width: layout.width, height: layout.height }}>
                <ReactFlow
                    nodes={steps}
                    edges={lines}
                    nodeTypes={NODE_TYPES}
                    edgeTypes={EDGE_TYPES}
                    style={PANE_STYLE}
                    defaultViewport={FIXED_VIEWPORT}
                    minZoom={1}
                    maxZoom={1}
                    panOnDrag={false}
                    panOnScroll={false}
                    zoomOnScroll={false}
                    zoomOnPinch={false}
                    zoomOnDoubleClick={false}
                    preventScrolling={false}
                    autoPanOnNodeFocus={false}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    nodesFocusable={false}
                    edgesFocusable={false}
                    elementsSelectable={false}
                    forceColorMode="dark"
                />
            </div>
        </div>
    );
}
