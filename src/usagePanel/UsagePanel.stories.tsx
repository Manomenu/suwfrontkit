import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { UsagePanel, type UsageLink } from "./UsagePanel.js";

interface Reference {
    kind: string;
    id: string;
    field: string;
}

function linkOf(reference: Reference): UsageLink {
    return {
        href: `/bots/appraiser/${reference.kind}s/${reference.id}/edit`,
        label: reference.id,
        detail: `${reference.kind} · ${reference.field}`,
    };
}

const ReferencePanel = UsagePanel<Reference>;

const meta = {
    component: ReferencePanel,
    args: {
        usage: {
            usedBy: [
                { kind: "article", id: "pricing", field: "content" },
                { kind: "article", id: "discounts", field: "llmGuide" },
                { kind: "procedure", id: "intake", field: "step Collect documents" },
            ],
            uses: [{ kind: "fact", id: "opening-hours", field: "content" }],
        },
        failure: null,
        linkOf,
    },
    render: (args) => (
        <div className="w-[720px]">
            <ReferencePanel {...args} />
        </div>
    ),
} satisfies Meta<typeof ReferencePanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Listed: Story = {
    play: async ({ canvasElement }) => {
        const usedBy = within(within(canvasElement).getByRole("region", { name: "Used by" }));
        await expect(usedBy.getByRole("link", { name: "intake" })).toHaveAttribute("href", "/bots/appraiser/procedures/intake/edit");
    },
};

export const NothingEitherWay: Story = {
    args: { usage: { usedBy: [], uses: [] } },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByText("Nothing uses this.")).toBeVisible();
        await expect(within(canvasElement).getByText("This uses nothing.")).toBeVisible();
    },
};

export const OnlyUsedBy: Story = {
    args: { showUses: false },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).queryByRole("region", { name: "Uses" })).toBeNull();
    },
};

export const Loading: Story = {
    args: { usage: null },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("status", { name: "Loading what uses this…" })).toBeVisible();
    },
};

export const Failed: Story = {
    args: { usage: null, failure: "The usage could not be loaded: the server is away." },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("alert")).toHaveTextContent("the server is away");
    },
};
