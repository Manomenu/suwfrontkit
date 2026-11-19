import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "../button/Button.js";
import { Page } from "../page/Page.js";
import { Table } from "../table/Table.js";
import { AppShell } from "./AppShell.js";
import { NavLink } from "./NavLink.js";

const STORAGE_KEY = "storybook.navigation-panel";

function Icon({ d }: { d: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={d} />
        </svg>
    );
}

const items = [
    { label: "Companies", d: "M4 21V5l8-3 8 3v16M9 21v-4h6v4M8 8h2M14 8h2M8 12h2M14 12h2" },
    { label: "Theses", d: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8" },
    { label: "Monitoring", d: "M2 12h4l3-8 4 16 3-8h6" },
    { label: "Briefs", d: "M3 7h18v13H3zM8 7V4h8v3M3 13h18" },
    { label: "Notebook", d: "M5 3h14v18H5zM9 3v18M12 8h4M12 12h4" },
    { label: "Portfolio", d: "M12 3a9 9 0 1 0 9 9h-9zM15 2.5A9 9 0 0 1 21.5 9H15z" },
    { label: "Backtests", d: "M3 12a9 9 0 1 0 3-6.7M3 3v5h5M12 7v5l3 3" },
];

async function expectIconsAlignedWithTheToggle(canvasElement: HTMLElement) {
    const centre = (element: Element | null) => {
        if (element === null) throw new Error("the icon is not on the page");
        const box = element.getBoundingClientRect();
        return box.left + box.width / 2;
    };
    const toggle = centre(within(canvasElement).getByRole("button", { name: "Navigation panel" }).querySelector("svg"));
    for (const link of within(canvasElement).getByRole("navigation", { name: "Main" }).querySelectorAll("a")) {
        await expect(centre(link.querySelector("svg"))).toBeCloseTo(toggle, 0);
    }
}

function Navigation() {
    return (
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
        appIcon: <Icon d="M3 3v18h18M7 15l4-4 3 3 6-7" />,
        appTitle: "suwstockdrill",
        home: (link) => <a href="#home" {...link} />,
        headerEnd: <span className="text-sm text-muted-foreground">Prices from 19 November</span>,
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

export const Expanded: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole("link", { name: "suwstockdrill" })).toHaveAttribute("href", "#home");
        await expect(canvas.getByRole("link", { name: "Companies" })).toHaveAttribute("aria-current", "page");
        await expect(canvas.getByRole("link", { name: "Companies" })).not.toHaveAttribute("aria-label");
        await expectIconsAlignedWithTheToggle(canvasElement);
    },
};

export const Collapsed: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const toggle = canvas.getByRole("button", { name: "Navigation panel" });
        await userEvent.click(toggle);
        await expect(toggle).toHaveAttribute("aria-expanded", "false");
        await expect(window.localStorage.getItem(STORAGE_KEY)).toBe("collapsed");
        const navigation = within(canvas.getByRole("navigation", { name: "Main" }));
        await expect(navigation.getAllByRole("link")).toHaveLength(items.length);
        await expect(navigation.queryByText("Theses")).toBeNull();
        await expect(navigation.getByRole("link", { name: "Companies" })).toHaveAttribute("aria-current", "page");
        await expect(navigation.getByRole("link", { name: "Theses" })).not.toHaveAttribute("aria-current");
        await expectIconsAlignedWithTheToggle(canvasElement);
    },
};

export const CollapsedShowsTheNameOnFocus: Story = {
    beforeEach: () => {
        window.localStorage.setItem(STORAGE_KEY, "collapsed");
    },
    play: async ({ canvasElement }) => {
        within(canvasElement).getByRole("link", { name: "Theses" }).focus();
        await expect(await within(document.body).findByRole("tooltip")).toHaveTextContent("Theses");
    },
};

export const PanelOnTheRight: Story = { args: { side: "right" } };
