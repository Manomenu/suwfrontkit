import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { CopyButton } from "./CopyButton.js";

afterEach(() => {
    vi.unstubAllGlobals();
});

function clipboard(writeText: (text: string) => Promise<void>) {
    vi.stubGlobal("navigator", { clipboard: { writeText } });
}

it("copies its value and says so until the value changes", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    clipboard(writeText);
    const { rerender } = render(<CopyButton value="sha256:4f2a" label="Copy the data version" />);

    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copy the data version" }));
        await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith("sha256:4f2a");
    expect(screen.getByRole("button").textContent).toBe("Copied");
    rerender(<CopyButton value="sha256:9c01" label="Copy the data version" />);
    expect(screen.getByRole("button").textContent).toBe("Copy the data version");
});

it("keeps its label when the browser refuses the clipboard", async () => {
    clipboard(() => Promise.reject(new Error("denied")));
    render(<CopyButton value="sha256:4f2a" label="Copy" copiedLabel="Done" />);

    await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Copy" }));
        await Promise.resolve();
    });

    expect(screen.getByRole("button").textContent).toBe("Copy");
});
