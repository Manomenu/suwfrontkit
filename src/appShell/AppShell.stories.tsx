import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "../button/Button.js";
import { Page } from "../page/Page.js";
import { Table } from "../table/Table.js";
import { AppShell } from "./AppShell.js";
import { NavLink } from "./NavLink.js";

const STORAGE_KEY = "storybook.navigation-panel";

const items = ["Companies", "Theses", "Monitoring", "Briefs", "Notebook", "Portfolio", "Backtests"];

function Navigation() {
    return (
        <nav aria-label="Main" className="flex flex-col gap-0.5">
            {items.map((item) => (
                <NavLink key={item} href={`#${item.toLowerCase()}`} current={item === "Companies"}>
                    {item}
                </NavLink>
            ))}
        </nav>
    );
}

function Content() {
    return (
        <Page title="Companies" actions={<Button>Add a company</Button>}>
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
        </Page>
    );
}

const meta = {
    component: AppShell,
    parameters: { layout: "fullscreen" },
    args: {
        header: <span className="text-lg font-bold">suwstockdrill</span>,
        panel: <Navigation />,
        panelLabel: "Navigation panel",
        storageKey: STORAGE_KEY,
        children: <Content />,
    },
    beforeEach: () => {
        window.localStorage.removeItem(STORAGE_KEY);
    },
} satisfies Meta<typeof AppShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};

export const Collapsed: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const toggle = canvas.getByRole("button", { name: "Navigation panel" });
        await userEvent.click(toggle);
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
        await expect(canvas.queryByRole("navigation", { name: "Main" })).toBeNull();
        await expect(window.localStorage.getItem(STORAGE_KEY)).toBe("collapsed");
    },
};

export const PanelOnTheRight: Story = { args: { side: "right" } };
