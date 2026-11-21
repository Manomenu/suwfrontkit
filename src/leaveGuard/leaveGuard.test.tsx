import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { isLeaveGuardActive, mayLeave, onLeaveGuardChange, useLeaveGuard, useLeaveGuardActive } from "./leaveGuard.js";

afterEach(() => {
    vi.restoreAllMocks();
});

function Form({ dirty, question }: { dirty: boolean; question?: string }) {
    useLeaveGuard(dirty, question);
    return <p>{useLeaveGuardActive() ? "unsaved" : "saved"}</p>;
}

it("lets the user leave without asking while nothing is unsaved", () => {
    const confirm = vi.spyOn(window, "confirm");
    render(<Form dirty={false} />);

    expect(mayLeave()).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
    expect(screen.getByText("saved")).toBeTruthy();
});

it("asks before leaving unsaved changes, in English by default, and follows the answer", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<Form dirty />);

    expect(screen.getByText("unsaved")).toBeTruthy();
    expect(mayLeave()).toBe(false);
    expect(mayLeave()).toBe(true);
    expect(confirm).toHaveBeenCalledWith("Discard the changes you have not saved?");
});

it("asks the app's own question", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Form dirty question="Porzucić niezapisane zmiany?" />);

    mayLeave();

    expect(confirm).toHaveBeenCalledWith("Porzucić niezapisane zmiany?");
});

it("stops asking once the changes are saved or the form is gone", () => {
    const confirm = vi.spyOn(window, "confirm");
    const { rerender, unmount } = render(<Form dirty />);

    rerender(<Form dirty={false} />);
    expect(mayLeave()).toBe(true);
    expect(screen.getByText("saved")).toBeTruthy();

    rerender(<Form dirty />);
    unmount();
    expect(mayLeave()).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
});

it("warns before the page is closed or reloaded while changes are unsaved", () => {
    const { rerender } = render(<Form dirty />);
    const closing = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(closing);
    expect(closing.defaultPrevented).toBe(true);

    rerender(<Form dirty={false} />);
    const closingAgain = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(closingAgain);
    expect(closingAgain.defaultPrevented).toBe(false);
});

it("tells every reader when the guard turns on and off", () => {
    const { result } = renderHook(() => useLeaveGuardActive());
    const guard = renderHook(
        ({ dirty }) => {
            useLeaveGuard(dirty);
        },
        { initialProps: { dirty: false } },
    );
    expect(result.current).toBe(false);

    act(() => {
        guard.rerender({ dirty: true });
    });
    expect(result.current).toBe(true);

    act(() => {
        guard.unmount();
    });
    expect(result.current).toBe(false);
});

it("tells code outside React whether a guard is on, and calls back each time it turns on or off until unsubscribed", () => {
    const changes: boolean[] = [];
    const stop = onLeaveGuardChange(() => {
        changes.push(isLeaveGuardActive());
    });
    const guard = renderHook(
        ({ dirty }) => {
            useLeaveGuard(dirty);
        },
        { initialProps: { dirty: false } },
    );
    expect(isLeaveGuardActive()).toBe(false);

    guard.rerender({ dirty: true });
    expect(isLeaveGuardActive()).toBe(true);
    guard.rerender({ dirty: false });
    stop();
    guard.rerender({ dirty: true });
    guard.unmount();

    expect(changes).toEqual([true, false]);
    expect(isLeaveGuardActive()).toBe(false);
});
