import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { FlowDiagram, type DiagramNode } from "./FlowDiagram.js";
import { layoutDiagram } from "./layout.js";
import { linesOf, type DiagramEdge } from "./lines.js";

const nodes: DiagramNode[] = [
    { id: "intake", name: "Collect documents", row: 0, column: 0, icon: "✋", details: <span data-state>Done</span> },
    { id: "check", name: "Check arrears", row: 1, column: 0, icon: "◆" },
    { id: "letter", name: "Compose demand letter", row: 2, column: 0, marks: <span title="External">🌐</span> },
    { id: "other", name: "Ask the employer", row: 2, column: 1, muted: true },
    ...Array.from({ length: 8 }, (_, index): DiagramNode => ({
        id: `later-${String(index)}`,
        name: `Later ${String(index)}`,
        row: index + 3,
        column: 0,
    })),
    { id: "mail", name: "Send demand", row: 11, column: 0 },
];

const edges: DiagramEdge[] = [
    { from: "intake", to: "check" },
    { from: "check", to: "letter", label: "yes" },
    { from: "check", to: "other", label: "otherwise" },
    { from: "letter", to: "mail", kind: "data", label: "demand-letter" },
];

function step(container: HTMLElement, id: string): HTMLElement {
    const found = container.querySelector<HTMLElement>(`[data-step="${id}"]`);
    if (found === null) throw new Error(`node ${id} is not on the diagram`);
    return found;
}

function frame(): HTMLElement {
    return screen.getByRole("figure", { name: "Procedure" });
}

beforeEach(() => {
    vi.stubGlobal(
        "ResizeObserver",
        class ResizeObserverForJsdomWithoutLayout {
            observe = () => undefined;
            unobserve = () => undefined;
            disconnect = () => undefined;
        },
    );
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

it("draws each node with its name, icon, marks and details, and a muted node dimmed", () => {
    const { container } = render(<FlowDiagram nodes={nodes} edges={edges} label="Procedure" />);

    expect(step(container, "intake").textContent).toBe("✋Collect documentsDone");
    expect(step(container, "check").textContent).toBe("◆Check arrears");
    expect(step(container, "letter").textContent).toBe("Compose demand letter🌐");
    expect(step(container, "other").firstElementChild?.nextElementSibling?.className).toContain("opacity-60");
    expect(container.querySelector("button")).toBeNull();
});

it("draws flow edges solid with the branch label by the source, data edges dashed with the label by the target", () => {
    const lines = linesOf(edges);

    expect(lines.map((line) => [line.label, line.type, line.style?.strokeDasharray, line.data?.["near"]])).toEqual([
        [undefined, "smoothstep", undefined, undefined],
        ["yes", "labelled", undefined, "source"],
        ["otherwise", "labelled", undefined, "source"],
        ["demand-letter", "labelled", "6 4", "target"],
    ]);
});

it("has no zoom, fit, lock or minimap control and keeps its viewport at scale 1", () => {
    const { container } = render(<FlowDiagram nodes={nodes} edges={edges} label="Procedure" />);

    expect(
        container.querySelector(".react-flow__controls, .react-flow__minimap, .react-flow__panel:not(.react-flow__attribution)"),
    ).toBeNull();
    expect(container.querySelector<HTMLElement>(".react-flow__viewport")?.style.transform).toMatch(
        /^translate\(0px(, ?0px)?\) scale\(1\)$/,
    );
});

it("with onNodeClick makes each node a button that opens it by mouse or keyboard, the selected one marked as current", () => {
    const opened = vi.fn<(id: string) => void>();
    render(<FlowDiagram nodes={nodes} edges={edges} label="Procedure" selectedId="check" onNodeClick={opened} />);

    fireEvent.click(screen.getByRole("button", { name: /Send demand/ }));

    expect(opened).toHaveBeenCalledWith("mail");
    expect(screen.getByRole("button", { name: /Check arrears/ }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("button", { name: /Send demand/ }).getAttribute("aria-current")).toBeNull();
});

it("scrolls its own frame to the focused node, and again on a new focus request", () => {
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(300);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(200);
    const mail = layoutDiagram(
        nodes.map((node) => ({ ...node, tall: node.details !== undefined })),
        edges,
    ).boxes.find((box) => box.id === "mail");
    if (mail === undefined) throw new Error("no mail");

    const { rerender } = render(<FlowDiagram nodes={nodes} edges={edges} label="Procedure" focusId="mail" />);
    const focusedAt = frame().scrollTop;
    act(() => {
        frame().scrollTop = 0;
    });
    rerender(<FlowDiagram nodes={nodes} edges={edges} label="Procedure" focusId="mail" focusRequest={1} />);

    expect(focusedAt).toBe(mail.y + mail.height / 2 - 100);
    expect(frame().scrollTop).toBe(focusedAt);
});
