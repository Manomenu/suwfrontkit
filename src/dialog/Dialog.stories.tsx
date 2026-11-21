import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../button/Button.js";
import { Field } from "../field/Field.js";
import { Input } from "../input/Input.js";
import { Dialog } from "./Dialog.js";

function RenameCompany({ startOpen, width }: { startOpen: boolean; width: "default" | "wide" }) {
    const [open, setOpen] = useState(startOpen);
    return (
        <>
            <Button
                type="button"
                variant="outline"
                onClick={() => {
                    setOpen(true);
                }}
            >
                Rename
            </Button>
            <Dialog
                open={open}
                onOpenChange={setOpen}
                width={width}
                title="Rename ASML Holding"
                description="The new name shows everywhere the company is listed."
                actions={
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Rename
                        </Button>
                    </>
                }
            >
                <Field prefix="rename" name="name" label="Name" hint="The name people know the company by." errors={[]}>
                    {(props) => <Input {...props} autoFocus defaultValue="ASML Holding" />}
                </Field>
            </Dialog>
        </>
    );
}

const meta = { component: RenameCompany, title: "Dialog", args: { startOpen: true, width: "default" } } satisfies Meta<
    typeof RenameCompany
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const Wide: Story = { args: { width: "wide" } };
