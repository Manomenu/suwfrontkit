import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "../button/Button.js";
import { ConfirmDialog } from "./ConfirmDialog.js";

function DeleteCompany({
    startOpen,
    variant,
    deletion,
}: {
    startOpen: boolean;
    variant: "default" | "destructive";
    deletion: "finishes" | "never finishes";
}) {
    const [open, setOpen] = useState(startOpen);
    const [deleted, setDeleted] = useState(false);
    return (
        <div className="flex items-center gap-3">
            <Button
                type="button"
                variant="destructive"
                onClick={() => {
                    setOpen(true);
                }}
            >
                Delete
            </Button>
            {deleted && <span>Deleted</span>}
            <ConfirmDialog
                open={open}
                onOpenChange={setOpen}
                title="Delete company ASML Holding?"
                description="This cannot be undone. Its theses and notes are deleted with it."
                variant={variant}
                confirmLabel="Delete company"
                cancelLabel="Keep it"
                pendingLabel="Deleting…"
                onConfirm={() =>
                    deletion === "finishes"
                        ? Promise.resolve().then(() => {
                              setDeleted(true);
                          })
                        : new Promise<void>(() => undefined)
                }
            />
        </div>
    );
}

const meta = {
    component: DeleteCompany,
    title: "ConfirmDialog",
    args: { startOpen: true, variant: "destructive", deletion: "finishes" },
} satisfies Meta<typeof DeleteCompany>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Destructive: Story = {};

export const Default: Story = { args: { variant: "default" } };

export const Pending: Story = {
    args: { deletion: "never finishes" },
    play: async () => {
        const dialog = await within(document.body).findByRole("alertdialog");
        await userEvent.click(within(dialog).getByRole("button", { name: "Delete company" }));
        await expect(within(dialog).getByRole("button", { name: "Deleting…" })).toHaveAttribute("aria-busy", "true");
        await expect(within(dialog).getByRole("button", { name: "Keep it" })).toBeDisabled();
    },
};
