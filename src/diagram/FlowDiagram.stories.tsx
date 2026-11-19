import "./diagram.css";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { Badge } from "../badge/Badge.js";
import { GraphicSplit } from "../graphicSplit/GraphicSplit.js";
import { Input } from "../input/Input.js";
import { Label } from "../label/Label.js";
import { Page } from "../page/Page.js";
import { Panel } from "../paper/Paper.js";
import { FlowDiagram, type DiagramNode } from "./FlowDiagram.js";
import type { DiagramEdge } from "./lines.js";

const nodes: DiagramNode[] = [
    { id: "intake", name: "Collect documents", row: 0, column: 0, icon: "✋", details: <Badge variant="success">Done</Badge> },
    { id: "check", name: "Check arrears", row: 1, column: 0, icon: "◆", details: <Badge variant="primary">To do</Badge> },
    {
        id: "letter",
        name: "Compose the demand letter",
        row: 2,
        column: 0,
        icon: "⚙️",
        details: <Badge variant="warning">Missing data</Badge>,
    },
    { id: "employer", name: "Ask the employer", row: 2, column: 1, icon: "✋", muted: true, details: <Badge>Skipped</Badge> },
    {
        id: "mail",
        name: "Send the demand",
        row: 3,
        column: 0,
        icon: "📧",
        marks: <span title="External: approved by a person before it goes out">🌐</span>,
        details: (
            <>
                <Badge variant="info">Waiting for reply</Badge>
                <span className="text-xs whitespace-nowrap text-muted-foreground">2026-12-01</span>
            </>
        ),
    },
    { id: "end", name: "Claim filed", row: 4, column: 0, icon: "■" },
];

const edges: DiagramEdge[] = [
    { from: "intake", to: "check" },
    { from: "check", to: "letter", label: "yes" },
    { from: "check", to: "employer", label: "otherwise" },
    { from: "letter", to: "mail" },
    { from: "letter", to: "mail", kind: "data", label: "demand letter" },
    { from: "employer", to: "end" },
    { from: "mail", to: "end" },
];

const meta = {
    component: FlowDiagram,
    args: { nodes, edges, label: "Diagram of the debt collection procedure" },
    render: (args) => (
        <div className="flex h-[720px] flex-col">
            <FlowDiagram {...args} />
        </div>
    ),
} satisfies Meta<typeof FlowDiagram>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Workflow: Story = {};

function Selecting() {
    const [selected, setSelected] = useState<string | null>("check");
    return (
        <div className="flex h-[720px] flex-col">
            <FlowDiagram
                nodes={nodes}
                edges={edges}
                label="Diagram of the debt collection procedure"
                selectedId={selected}
                onNodeClick={setSelected}
            />
        </div>
    );
}

export const SelectsANodeOnClick: Story = {
    render: () => <Selecting />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole("button", { name: /Send the demand/ }));
        await expect(canvas.getByRole("button", { name: /Send the demand/ })).toHaveAttribute("aria-current", "true");
        await expect(canvas.getByRole("button", { name: /Check arrears/ })).not.toHaveAttribute("aria-current");
    },
};

export const NextToItsForm: Story = {
    render: (args) => (
        <GraphicSplit graphic={<FlowDiagram {...args} selectedId="letter" onNodeClick={() => undefined} />}>
            <Page title="Debt collection procedure">
                <Panel title="Compose the demand letter">
                    <Label htmlFor="template">Template</Label>
                    <Input id="template" defaultValue="Demand for payment, v3" />
                </Panel>
            </Page>
        </GraphicSplit>
    ),
};
