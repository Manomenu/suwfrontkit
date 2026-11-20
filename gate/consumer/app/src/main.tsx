import "./index.css";

import { Alert, AppShell, Badge, Button, Field, Input, NavLink, Page, Table } from "@maniumek/suwfrontkit";
import { FlowDiagram, type DiagramEdge, type DiagramNode } from "@maniumek/suwfrontkit/diagram";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

const items = ["Companies", "Theses", "Monitoring", "Briefs", "Notebook", "Portfolio", "Backtests"];

const steps: DiagramNode[] = [
    { id: "intake", name: "Collect documents", row: 0, column: 0, details: <Badge variant="success">Done</Badge> },
    { id: "check", name: "Check arrears", row: 1, column: 0 },
    { id: "letter", name: "Send the demand", row: 2, column: 0 },
];

const joins: DiagramEdge[] = [
    { from: "intake", to: "check" },
    { from: "check", to: "letter", label: "yes" },
];

function Procedure() {
    const [selected, setSelected] = useState<string | null>(null);
    return (
        <div className="flex h-[420px] flex-col">
            <FlowDiagram nodes={steps} edges={joins} label="Diagram of the procedure" selectedId={selected} onNodeClick={setSelected} />
        </div>
    );
}

function App() {
    return (
        <AppShell
            header={<span className="text-lg font-bold">consumer</span>}
            panel={
                <nav aria-label="Main" className="flex flex-col gap-0.5">
                    {items.map((item) => (
                        <NavLink key={item} href={`#${item.toLowerCase()}`} current={item === "Companies"}>
                            {item}
                        </NavLink>
                    ))}
                </nav>
            }
            panelLabel="Navigation panel"
            storageKey="consumer.navigation-panel"
        >
            <Page title="Companies" titleAside={<Badge variant="info">3 new</Badge>} actions={<Button>Add a company</Button>}>
                <Alert variant="warning">The price feed is 3 days old.</Alert>
                <Table>
                    <thead>
                        <tr>
                            <th>Ticker</th>
                            <th>Name</th>
                            <th>Thesis</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ASML</td>
                            <td>ASML Holding</td>
                            <td>Monopoly on EUV machines</td>
                        </tr>
                        <tr>
                            <td>CDR</td>
                            <td>CD Projekt</td>
                            <td>Next title in 2027</td>
                        </tr>
                    </tbody>
                </Table>
                <div className="w-96">
                    <Field prefix="company" name="ticker" label="Ticker" hint="The exchange symbol." errors={[]}>
                        {(props) => <Input {...props} defaultValue="ASML" />}
                    </Field>
                </div>
                <Procedure />
            </Page>
        </AppShell>
    );
}

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root element");

createRoot(root).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
