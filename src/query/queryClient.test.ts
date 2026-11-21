import { focusManager, onlineManager, QueryObserver, type QueryClient } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";

import { ApiError, retryUnlessRefused } from "../apiClient/apiClient.js";
import { createQueryClient } from "./queryClient.js";

const clients: QueryClient[] = [];

function client(): QueryClient {
    const made = createQueryClient();
    made.mount();
    clients.push(made);
    return made;
}

afterEach(() => {
    for (const made of clients.splice(0)) {
        made.unmount();
        made.clear();
    }
    focusManager.setFocused(undefined);
    onlineManager.setOnline(true);
});

async function settled(observer: { getCurrentResult: () => { fetchStatus: string } }): Promise<void> {
    await vi.waitFor(() => {
        expect(observer.getCurrentResult().fetchStatus).toBe("idle");
    });
}

it("asks a refused read once and shows the refusal at once", async () => {
    const read = vi.fn(() => Promise.reject(new ApiError(404, { title: "Not Found" })));
    const observer = new QueryObserver(client(), { queryKey: ["company", "ASML"], queryFn: read });
    const stop = observer.subscribe(() => undefined);

    await settled(observer);
    stop();

    expect(observer.getCurrentResult().status).toBe("error");
    expect(read).toHaveBeenCalledTimes(1);
});

it("retries a read with the kit's retryUnlessRefused: a refusal never, a failure that may pass at most twice", () => {
    expect(client().getDefaultOptions().queries?.retry).toBe(retryUnlessRefused);
});

it("never reads again on focus or reconnect, so a refetch cannot replace a form with unsaved changes", async () => {
    const read = vi.fn(() => Promise.resolve({ name: "ASML Holding" }));
    const observer = new QueryObserver(client(), { queryKey: ["company", "ASML"], queryFn: read });
    const stop = observer.subscribe(() => undefined);
    await settled(observer);

    focusManager.setFocused(false);
    focusManager.setFocused(true);
    onlineManager.setOnline(false);
    onlineManager.setOnline(true);
    await settled(observer);
    stop();

    expect(read).toHaveBeenCalledTimes(1);
});

it("gives every call a client of its own", () => {
    expect(client()).not.toBe(client());
});
