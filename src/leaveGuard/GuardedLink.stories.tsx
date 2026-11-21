import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, spyOn, userEvent, within } from "storybook/test";

import { Anchor } from "../anchor/Anchor.js";
import { Input } from "../input/Input.js";
import { Label } from "../label/Label.js";
import { GuardedLink } from "./GuardedLink.js";
import { useLeaveGuard } from "./leaveGuard.js";
import { LinkProvider } from "./LinkProvider.js";

function EditCompany() {
    const [name, setName] = useState("ASML Holding");
    const [at, setAt] = useState("/companies/ASML");
    useLeaveGuard(name !== "ASML Holding");
    return (
        <LinkProvider navigate={setAt}>
            <div className="flex max-w-reading flex-col gap-3">
                <Anchor href="/companies" className="self-start">
                    ← Back to the companies
                </Anchor>
                <Label htmlFor="company-name">Name</Label>
                <Input
                    id="company-name"
                    value={name}
                    onChange={(event) => {
                        setName(event.target.value);
                    }}
                />
                <GuardedLink href="/companies/new">Add a company</GuardedLink>
                <p className="text-muted-foreground">Now at {at}</p>
            </div>
        </LinkProvider>
    );
}

const meta = { component: EditCompany, title: "GuardedLink" } satisfies Meta<typeof EditCompany>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LeavesWhenNothingIsUnsaved: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const back = canvas.getByRole("link", { name: "← Back to the companies" });
        await expect(back).toHaveAttribute("href", "/companies");
        await userEvent.click(back);
        await expect(canvas.getByText("Now at /companies")).toBeVisible();
    },
};

export const AsksBeforeLeavingUnsavedChanges: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const confirm = spyOn(window, "confirm").mockReturnValue(false);
        await userEvent.type(canvas.getByLabelText("Name"), " N.V.");
        await userEvent.click(canvas.getByRole("link", { name: "← Back to the companies" }));
        await expect(confirm).toHaveBeenCalledWith("Discard the changes you have not saved?");
        await expect(canvas.getByText("Now at /companies/ASML")).toBeVisible();
        confirm.mockRestore();
    },
};
