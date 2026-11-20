import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Alert } from "../alert/Alert.js";
import { ApiError, createApi, dataOf } from "./apiClient.js";

interface paths {
    "/api/companies/{ticker}": {
        delete: {
            parameters: { path: { ticker: string } };
            responses: {
                204: { content?: never };
                409: { content: { "application/problem+json": { title: string; detail: string } } };
            };
        };
    };
}

const api = createApi<paths>({
    fetch: () =>
        Promise.resolve(
            new Response(JSON.stringify({ title: "Conflict", detail: "ASML Holding has 3 theses: delete them first.", status: 409 }), {
                status: 409,
                headers: { "content-type": "application/problem+json" },
            }),
        ),
});

function DeleteRefused() {
    const [refusal, setRefusal] = useState<ApiError | null>(null);
    useEffect(() => {
        dataOf(api.DELETE("/api/companies/{ticker}", { params: { path: { ticker: "ASML" } } })).catch((error: unknown) => {
            if (error instanceof ApiError) setRefusal(error);
        });
    }, []);
    if (refusal === null) return <p className="text-muted-foreground">Deleting…</p>;
    return (
        <Alert variant="destructive">
            {refusal.message} ({refusal.status})
        </Alert>
    );
}

const meta = { component: DeleteRefused, title: "ApiClient" } satisfies Meta<typeof DeleteRefused>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RefusalFromProblemDetails: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByRole("alert")).toHaveTextContent("ASML Holding has 3 theses: delete them first. (409)");
    },
};
