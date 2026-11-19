import "./index.css";

import { Alert, AppShell, Badge, Button, Field, Input, NavLink, Page, Table } from "@maniumek/suwfrontstyle";
import { FlowDiagram, type DiagramEdge, type DiagramNode } from "@maniumek/suwfrontstyle/diagram";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

function Icon({ d }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
        </svg>
    );
}

const items = [
    { label: "Companies", d: "M4 21V5l8-3 8 3v16M9 21v-4h6v4" },
    { label: "Theses", d: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8" },
    { label: "Monitoring", d: "M2 12h4l3-8 4 16 3-8h6" },
    { label: "Briefs", d: "M3 7h18v13H3zM8 7V4h8v3M3 13h18" },
    { label: "Notebook", d: "M5 3h14v18H5zM9 3v18M12 8h4M12 12h4" },
    { label: "Portfolio", d: "M12 3a9 9 0 1 0 9 9h-9z" },
    { label: "Backtests", d: "M3 12a9 9 0 1 0 3-6.7M3 3v5h5M12 7v5l3 3" },
];

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
            appIcon={<Icon d="M3 3v18h18M7 15l4-4 3 3 6-7" />}
            appTitle="consumer"
            home={(link) => <a href="/" {...link} />}
            panel={
                <nav aria-label="Main" className="flex flex-col gap-0.5">
                    {items.map((item) => (
                        <NavLink
                            key={item.label}
                            href={`#${item.label.toLowerCase()}`}
                            icon={<Icon d={item.d} />}
                            label={item.label}
                            current={item.label === "Companies"}
                        />
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
