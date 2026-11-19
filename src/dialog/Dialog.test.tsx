import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Dialog } from "./Dialog.js";

it("is a modal dialog named by its title, described by its description, hiding the page from assistive technology", () => {
    const { container } = render(<Dialog open onOpenChange={vi.fn()} title="Rename" description="The new name shows everywhere." />);

    const dialog = screen.getByRole("dialog", { name: "Rename" });
    expect(container.getAttribute("aria-hidden")).toBe("true");
    expect(document.getElementById(dialog.getAttribute("aria-describedby") ?? "")?.textContent).toBe("The new name shows everywhere.");
});

it("without a description points at none", () => {
    render(<Dialog open onOpenChange={vi.fn()} title="Rename" />);

    expect(screen.getByRole("dialog").hasAttribute("aria-describedby")).toBe(false);
});

it("asks to close on Escape and renders nothing while closed", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
        <Dialog open onOpenChange={onOpenChange} title="Rename" actions={<button type="button">Save</button>}>
            <p>Body</p>
        </Dialog>,
    );
    expect(screen.getByText("Body")).toBeTruthy();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(<Dialog open={false} onOpenChange={onOpenChange} title="Rename" />);
    expect(screen.queryByRole("dialog")).toBeNull();
});

function Opener() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setOpen(true);
                }}
            >
                Rename
            </button>
            <Dialog
                open={open}
                onOpenChange={setOpen}
                title="Rename ASML"
                actions={
                    <>
                        <button type="button">Cancel</button>
                        <button type="button">Save</button>
                    </>
                }
            />
        </>
    );
}

it("keeps Tab inside, closes on Escape and gives focus back to what opened it", async () => {
    render(<Opener />);
    const opener = screen.getByRole("button", { name: "Rename" });
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole("dialog", { name: "Rename ASML" });
    const save = screen.getByRole("button", { name: "Save" });
    save.focus();
    fireEvent.keyDown(save, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancel" }));

    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => {
        expect(document.activeElement).toBe(opener);
    });
});
