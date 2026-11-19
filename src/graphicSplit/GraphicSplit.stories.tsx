import type { Meta, StoryObj } from "@storybook/react-vite";

import { Page } from "../page/Page.js";
import { Panel, Paper } from "../paper/Paper.js";
import { GraphicSplit } from "./GraphicSplit.js";

const meta = { component: GraphicSplit } satisfies Meta<typeof GraphicSplit>;
export default meta;
type Story = StoryObj<typeof meta>;

const data = (
    <Page title="Debt collection procedure">
        <Panel title="Steps">
            <p>Collect documents, check arrears, compose the demand letter, send it.</p>
        </Panel>
        <Panel title="History">
            <p>Anna edited the procedure yesterday.</p>
        </Panel>
    </Page>
);

export const WithAGraphic: Story = {
    args: {
        graphic: <Paper className="flex flex-1 items-center justify-center text-muted-foreground">The diagram of the procedure</Paper>,
        children: data,
    },
};

export const WithoutAGraphic: Story = { args: { graphic: null, children: data } };
