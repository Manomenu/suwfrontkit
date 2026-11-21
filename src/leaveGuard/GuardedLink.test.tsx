import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { GuardedLink } from "./GuardedLink.js";
import { useLeaveGuard } from "./leaveGuard.js";

afterEach(() => {
    vi.restoreAllMocks();
});

function Screen({ dirty, navigate, target }: { dirty: boolean; navigate: (href: string) => void; target?: string }) {
    useLeaveGuard(dirty);
    return (
        <GuardedLink href="/companies" navigate={navigate} {...(target === undefined ? {} : { target })}>
            Back to the companies
        </GuardedLink>
    );
}

const link = () => screen.getByRole("link", { name: "Back to the companies" });

it("is a real link to its address", () => {
    render(<Screen dirty={false} navigate={vi.fn()} />);

    expect(link().getAttribute("href")).toBe("/companies");
});

it("navigates with the app's router, without asking, while nothing is unsaved", () => {
    const navigate = vi.fn();
    const confirm = vi.spyOn(window, "confirm");
    render(<Screen dirty={false} navigate={navigate} />);

    const followed = fireEvent.click(link());

    expect(followed).toBe(false);
    expect(navigate).toHaveBeenCalledWith("/companies");
    expect(confirm).not.toHaveBeenCalled();
});

it("asks before leaving unsaved changes and stays when the user says no", () => {
    const navigate = vi.fn();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<Screen dirty navigate={navigate} />);

    const followed = fireEvent.click(link());

    expect(followed).toBe(false);
    expect(confirm).toHaveBeenCalledWith("Discard the changes you have not saved?");
    expect(navigate).not.toHaveBeenCalled();
});

it("leaves unsaved changes when the user says yes", () => {
    const navigate = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<Screen dirty navigate={navigate} />);

    fireEvent.click(link());

    expect(navigate).toHaveBeenCalledWith("/companies");
});

it.each([
    ["Ctrl", { ctrlKey: true }],
    ["Cmd", { metaKey: true }],
    ["Shift", { shiftKey: true }],
    ["Alt", { altKey: true }],
    ["the middle button", { button: 1 }],
])("leaves a click with %s to the browser, as a plain link, without asking", (_, click) => {
    const navigate = vi.fn();
    const confirm = vi.spyOn(window, "confirm");
    render(<Screen dirty navigate={navigate} />);

    const followed = fireEvent.click(link(), click);

    expect(followed).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
});

it("leaves a link that opens in another tab to the browser", () => {
    const navigate = vi.fn();
    const confirm = vi.spyOn(window, "confirm");
    render(<Screen dirty navigate={navigate} target="_blank" />);

    expect(fireEvent.click(link())).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
});

it("calls the app's own onClick first, and does nothing more when it prevents the click", () => {
    const navigate = vi.fn();
    render(
        <GuardedLink
            href="/companies"
            navigate={navigate}
            onClick={(event) => {
                event.preventDefault();
            }}
        >
            Back to the companies
        </GuardedLink>,
    );

    fireEvent.click(link());

    expect(navigate).not.toHaveBeenCalled();
});
