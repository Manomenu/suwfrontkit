import "./index.css";

import { Alert, AppShell, Badge, Button, Field, Input, NavLink, Page, Table } from "@maniumek/suwfrontkit";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const items = ["Companies", "Theses", "Monitoring", "Briefs", "Notebook", "Portfolio", "Backtests"];

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
