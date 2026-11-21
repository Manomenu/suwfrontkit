import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Alert } from "../alert/Alert.js";
import { ApiError } from "../apiClient/apiClient.js";
import { createQueryClient } from "./queryClient.js";

function companyOf(ticker: string): Promise<{ name: string }> {
    return Promise.reject(new ApiError(404, { detail: `There is no company ${ticker}.` }));
}

function Company({ ticker }: { ticker: string }) {
    const company = useQuery({ queryKey: ["company", ticker], queryFn: () => companyOf(ticker) });
    if (company.error !== null) return <Alert variant="destructive">{company.error.message}</Alert>;
    return <p className="text-muted-foreground">{company.data?.name ?? "Loading…"}</p>;
}

function UnknownCompany() {
    return (
        <QueryClientProvider client={createQueryClient()}>
            <Company ticker="XYZW" />
        </QueryClientProvider>
    );
}

const meta = { component: UnknownCompany, title: "Query" } satisfies Meta<typeof UnknownCompany>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RefusedAtOnce: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByRole("alert", {}, { timeout: 500 })).toHaveTextContent("There is no company XYZW.");
    },
};
