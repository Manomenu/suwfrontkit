import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog.js";

function deferred() {
    const settle = { resolve: () => undefined as unknown, reject: () => undefined as unknown };
    const promise = new Promise<void>((resolve, reject) => {
        settle.resolve = resolve;
        settle.reject = () => {
            reject(new Error("refused"));
        };
    });
    return { promise, settle };
}

it("is an alert dialog that starts on Cancel and names its labels", () => {
    render(<ConfirmDialog open onOpenChange={vi.fn()} title="Delete ASML?" onConfirm={vi.fn()} />);

    screen.getByRole("alertdialog", { name: "Delete ASML?" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancel" }));
    screen.getByRole("button", { name: "Confirm" });
});

it("a destructive confirmation takes the destructive button", () => {
    render(
        <ConfirmDialog open onOpenChange={vi.fn()} title="Delete ASML?" variant="destructive" confirmLabel="Delete" onConfirm={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Delete" }).dataset["variant"]).toBe("destructive");
});

it("closes right after a confirmation that returns no promise", () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(<ConfirmDialog open onOpenChange={onOpenChange} title="Delete ASML?" onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
});

it("waits for a promise: busy, not closable, confirmed once, closed when it resolves", async () => {
    const onOpenChange = vi.fn();
    const work = deferred();
    const onConfirm = vi.fn(() => work.promise);
    render(<ConfirmDialog open onOpenChange={onOpenChange} title="Delete ASML?" pendingLabel="Deleting…" onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    const busy = screen.getByRole("button", { name: "Deleting…" });
    expect(busy.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveProperty("disabled", true);
    fireEvent.click(busy);
    fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();

    await act(async () => {
        work.settle.resolve();
        await work.promise;
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
});

it("stays open and can be confirmed again when the promise rejects", async () => {
    const onOpenChange = vi.fn();
    const work = deferred();
    render(<ConfirmDialog open onOpenChange={onOpenChange} title="Delete ASML?" onConfirm={() => work.promise} />);

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    await act(async () => {
        work.settle.reject();
        await work.promise.catch(() => undefined);
    });

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Confirm" }).getAttribute("aria-busy")).toBe("false");
});
