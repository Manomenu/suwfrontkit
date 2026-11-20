import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, spyOn, userEvent, within } from "storybook/test";

import { Badge } from "../badge/Badge.js";
import { Button } from "../button/Button.js";
import { Input } from "../input/Input.js";
import { Label } from "../label/Label.js";
import { mayLeave, useLeaveGuard, useLeaveGuardActive } from "./leaveGuard.js";

function Unsaved() {
    return useLeaveGuardActive() ? <Badge variant="warning">Unsaved changes</Badge> : <Badge>Saved</Badge>;
}

function EditCompany() {
    const [name, setName] = useState("ASML Holding");
    const [left, setLeft] = useState<boolean | null>(null);
    useLeaveGuard(name !== "ASML Holding");
    return (
        <div className="flex max-w-reading flex-col gap-3">
            <div className="flex items-center gap-2">
                <Label htmlFor="company-name">Name</Label>
                <Unsaved />
            </div>
            <Input
                id="company-name"
                value={name}
                onChange={(event) => {
                    setName(event.target.value);
                }}
            />
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setLeft(mayLeave());
                    }}
                >
                    Back to the companies
                </Button>
                {left !== null && <span>{left ? "Left the form" : "Stayed on the form"}</span>}
            </div>
        </div>
    );
}

const meta = { component: EditCompany, title: "LeaveGuard" } satisfies Meta<typeof EditCompany>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NothingUnsaved: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const confirm = spyOn(window, "confirm");
        await userEvent.click(canvas.getByRole("button", { name: "Back to the companies" }));
        await expect(confirm).not.toHaveBeenCalled();
        await expect(canvas.getByText("Left the form")).toBeVisible();
        confirm.mockRestore();
    },
};

export const AsksBeforeLeaving: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const confirm = spyOn(window, "confirm").mockReturnValue(false);
        await userEvent.type(canvas.getByLabelText("Name"), " N.V.");
        await expect(canvas.getByText("Unsaved changes")).toBeVisible();
        await userEvent.click(canvas.getByRole("button", { name: "Back to the companies" }));
        await expect(confirm).toHaveBeenCalledWith("Discard the changes you have not saved?");
        await expect(canvas.getByText("Stayed on the form")).toBeVisible();
        confirm.mockRestore();
    },
};
