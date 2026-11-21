import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { ErrorBoundary } from "./ErrorBoundary.js";
import { ErrorScreen } from "./ErrorScreen.js";

let broken = true;

function Report() {
    if (broken) throw new Error("steps is not iterable");
    return <p>Report</p>;
}

beforeEach(() => {
    broken = true;
    vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
    vi.restoreAllMocks();
});

it("shows what failed with a way to try again instead of a blank page, and tells the app", () => {
    const onError = vi.fn();
    render(
        <ErrorBoundary onError={onError}>
            <Report />
        </ErrorBoundary>,
    );

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Something went wrong");
    expect(alert.textContent).toContain("steps is not iterable");
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "steps is not iterable" }), expect.anything());
});

it("trying again renders the children afresh", () => {
    render(
        <ErrorBoundary>
            <Report />
        </ErrorBoundary>,
    );
    broken = false;

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("Report")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
});

it("renders the app's own fallback with the error and the retry", () => {
    render(
        <ErrorBoundary
            fallback={({ error, retry }) => (
                <button type="button" onClick={retry}>
                    {error instanceof Error ? `Reload after: ${error.message}` : "Reload"}
                </button>
            )}
        >
            <Report />
        </ErrorBoundary>,
    );
    broken = false;

    fireEvent.click(screen.getByRole("button", { name: "Reload after: steps is not iterable" }));

    expect(screen.getByText("Report")).toBeTruthy();
});

it("a new key resets the boundary, as when the app moves to another screen", () => {
    function Screens() {
        const [screenName, setScreenName] = useState("report");
        return (
            <>
                <button
                    type="button"
                    onClick={() => {
                        broken = false;
                        setScreenName("companies");
                    }}
                >
                    Companies
                </button>
                <ErrorBoundary key={screenName}>
                    <Report />
                </ErrorBoundary>
            </>
        );
    }
    render(<Screens />);
    expect(screen.getByRole("alert")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Companies" }));

    expect(screen.getByText("Report")).toBeTruthy();
});

it("the screen takes its labels from the app and shows no empty message for a thrown non-error", () => {
    render(<ErrorScreen error={undefined} onRetry={vi.fn()} title="Ekran nie działa" retryLabel="Spróbuj ponownie" />);

    expect(screen.getByRole("alert").textContent).toBe("Ekran nie działaSpróbuj ponownie");
});

it("the screen shows the app's own ways out in place of the retry", () => {
    render(
        <ErrorScreen
            error={new Error("steps is not iterable")}
            title="This screen failed to open."
            actions={
                <>
                    <a href="/report">Reload</a>
                    <a href="/">Back to the list</a>
                </>
            }
        />,
    );

    expect(screen.getByRole("alert").textContent).toBe("This screen failed to open.steps is not iterableReloadBack to the list");
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("link", { name: "Back to the list" }).getAttribute("href")).toBe("/");
});
