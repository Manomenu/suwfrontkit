import { expect, expectTypeOf, it } from "vitest";

import { ApiError, createApi, dataOf } from "./apiClient.js";

interface Company {
    ticker: string;
    name: string;
}

interface Problem {
    title?: string;
    detail?: string;
    status?: number;
}

interface paths {
    "/api/companies/{ticker}": {
        parameters: { query?: never; header?: never; path: { ticker: string }; cookie?: never };
        get: {
            parameters: { query?: never; header?: never; path: { ticker: string }; cookie?: never };
            requestBody?: never;
            responses: {
                200: { headers: Record<string, unknown>; content: { "application/json": Company } };
                404: { headers: Record<string, unknown>; content: { "application/problem+json": Problem } };
            };
        };
        delete: {
            parameters: { query?: never; header?: never; path: { ticker: string }; cookie?: never };
            requestBody?: never;
            responses: {
                204: { headers: Record<string, unknown>; content?: never };
                409: { headers: Record<string, unknown>; content: { "application/problem+json": Problem } };
            };
        };
    };
    "/api/companies": {
        parameters: { query?: never; header?: never; path?: never; cookie?: never };
        post: {
            parameters: { query?: never; header?: never; path?: never; cookie?: never };
            requestBody: { content: { "application/json": Company } };
            responses: {
                201: { headers: Record<string, unknown>; content: { "application/json": Company } };
                400: { headers: Record<string, unknown>; content: { "application/problem+json": Problem } };
            };
        };
    };
}

class PageRequest extends Request {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
        super(typeof input === "string" ? new URL(input, "http://127.0.0.1:3330") : input, init);
    }
}

function answering(status: number, body?: unknown, statusText = "") {
    const seen: Request[] = [];
    const api = createApi<paths>({
        Request: PageRequest,
        fetch: (request: Request) => {
            seen.push(request);
            const json = body === undefined ? null : JSON.stringify(body);
            return Promise.resolve(
                new Response(json, {
                    status,
                    statusText,
                    headers: json === null ? {} : { "content-type": "application/problem+json" },
                }),
            );
        },
    });
    return { api, seen };
}

it("calls the page's own origin at the contract's path, with the path parameters filled in", async () => {
    const { api, seen } = answering(200, { ticker: "ASML", name: "ASML Holding" });

    const company = await dataOf(api.GET("/api/companies/{ticker}", { params: { path: { ticker: "AS ML" } } }));

    expect(company).toEqual({ ticker: "ASML", name: "ASML Holding" });
    expect(new URL(seen[0]?.url ?? "").pathname).toBe("/api/companies/AS%20ML");
    expectTypeOf(company).toEqualTypeOf<Company>();
});

it("sends a JSON body with its content type", async () => {
    const { api, seen } = answering(201, { ticker: "ASML", name: "ASML Holding" });

    await dataOf(api.POST("/api/companies", { body: { ticker: "ASML", name: "ASML Holding" } }));

    expect(seen[0]?.method).toBe("POST");
    expect(seen[0]?.headers.get("content-type")).toBe("application/json");
    expect(await seen[0]?.json()).toEqual({ ticker: "ASML", name: "ASML Holding" });
});

it("gives nothing back for 204 No Content", async () => {
    const { api } = answering(204);

    const deleting = dataOf(api.DELETE("/api/companies/{ticker}", { params: { path: { ticker: "ASML" } } }));

    await expect(deleting).resolves.toBeUndefined();
    expectTypeOf(deleting).resolves.toEqualTypeOf<undefined>();
});

it("throws an ApiError with the status and the ProblemDetails, worded by its detail", async () => {
    const { api } = answering(409, { title: "Conflict", detail: "ASML has theses: delete them first.", status: 409, code: "in-use" });

    const failure = await dataOf(api.DELETE("/api/companies/{ticker}", { params: { path: { ticker: "ASML" } } })).catch(
        (error: unknown) => error,
    );

    expect(failure).toBeInstanceOf(ApiError);
    expect(failure).toMatchObject({
        name: "ApiError",
        status: 409,
        message: "ASML has theses: delete them first.",
        problem: { code: "in-use" },
    });
});

it("words a validation problem by its field messages, then by its title, then by the status", () => {
    expect(
        new ApiError(400, {
            title: "One or more validation errors occurred.",
            errors: { name: ["Name is required."], ticker: ["Too long."] },
        }).message,
    ).toBe("Name is required. Too long.");
    expect(new ApiError(404, { title: "Not Found", status: 404 }).message).toBe("Not Found");
    expect(new ApiError(502, "<html>Bad Gateway</html>", "Bad Gateway").message).toBe("502 Bad Gateway");
    expect(new ApiError(502, "<html>Bad Gateway</html>", "Bad Gateway").problem).toEqual({});
});

it("throws an ApiError for a failure with no body", async () => {
    const { api } = answering(503, undefined, "Service Unavailable");

    await expect(dataOf(api.GET("/api/companies/{ticker}", { params: { path: { ticker: "ASML" } } }))).rejects.toMatchObject({
        status: 503,
        message: "503 Service Unavailable",
    });
});

it("takes another base address", async () => {
    const seen: string[] = [];
    const api = createApi<paths>({
        baseUrl: "http://127.0.0.1:6330",
        fetch: (request: Request) => {
            seen.push(request.url);
            return Promise.resolve(new Response(null, { status: 204 }));
        },
    });

    await dataOf(api.DELETE("/api/companies/{ticker}", { params: { path: { ticker: "ASML" } } }));

    expect(seen).toEqual(["http://127.0.0.1:6330/api/companies/ASML"]);
});
