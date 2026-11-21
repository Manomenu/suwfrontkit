import { QueryClient } from "@tanstack/react-query";

import { retryUnlessRefused } from "../apiClient/apiClient.js";

export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: { queries: { retry: retryUnlessRefused, refetchOnWindowFocus: false, refetchOnReconnect: false } },
    });
}
