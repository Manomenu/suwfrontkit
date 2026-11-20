import createClient, { type Client, type ClientOptions } from "openapi-fetch";

type Problem = Readonly<Record<string, unknown>>;

function text(value: unknown): string | null {
    return typeof value === "string" && value !== "" ? value : null;
}

function fieldMessages(errors: unknown): string | null {
    if (typeof errors !== "object" || errors === null) return null;
    const messages = Object.values(errors).flatMap((value: unknown) =>
        Array.isArray(value) ? (value as unknown[]).filter((item): item is string => text(item) !== null) : [],
    );
    return messages.length === 0 ? null : messages.join(" ");
}

function problemOf(body: unknown): Problem {
    return typeof body === "object" && body !== null && !Array.isArray(body) ? (body as Problem) : {};
}

export class ApiError extends Error {
    override readonly name = "ApiError";
    readonly status: number;
    readonly problem: Problem;

    constructor(status: number, body: unknown, statusText = "") {
        const problem = problemOf(body);
        super(
            text(problem["detail"]) ??
                fieldMessages(problem["errors"]) ??
                text(problem["title"]) ??
                `${String(status)} ${statusText}`.trimEnd(),
        );
        this.status = status;
        this.problem = problem;
    }
}

class PageRequest extends Request {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
        super(typeof input === "string" ? new URL(input, globalThis.location.href) : input, init);
    }
}

export function createApi<Paths extends object>(options: ClientOptions = {}): Client<Paths> {
    return createClient<Paths>({
        Request: PageRequest,
        fetch: (request: Request) => globalThis.fetch(request),
        ...options,
    });
}

type Answer<Data> = Promise<{ data?: Data; error?: unknown; response: Response }>;

export async function dataOf<Data>(call: Answer<Data>): Promise<[Data] extends [never] ? undefined : Data> {
    const { data, error, response } = await call;
    if (!response.ok) throw new ApiError(response.status, error, response.statusText);
    return data as [Data] extends [never] ? undefined : Data;
}
