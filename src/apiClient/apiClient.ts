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

export interface Mistake<Code extends string = string> {
    readonly code: Code;
    readonly message: string;
    readonly fix: string;
    readonly at?: string;
    readonly [member: string]: unknown;
}

function mistakeOf(item: unknown): Mistake | null {
    const { code, message, fix, at, ...rest } = problemOf(item);
    const [shared, said, fixed] = [text(code), text(message), text(fix)];
    if (shared === null || said === null || fixed === null) return null;
    return { ...rest, code: shared, message: said, fix: fixed, ...(typeof at === "string" ? { at } : {}) };
}

function mistakesIn(problem: Problem): readonly Mistake[] {
    const listed = problem["mistakes"];
    if (!Array.isArray(listed)) return [];
    return (listed as unknown[]).map(mistakeOf).filter((mistake): mistake is Mistake => mistake !== null);
}

export class ApiError extends Error {
    override readonly name = "ApiError";
    readonly status: number;
    readonly problem: Problem;
    readonly code: string | null;
    readonly mistakes: readonly Mistake[];

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
        this.code = text(problem["code"]);
        this.mistakes = mistakesIn(problem);
    }
}

export interface RefusalReader<Code extends string, MistakeCode extends string = Code> {
    codeOf: (error: unknown) => Code | null;
    mistakesOf: (error: unknown) => readonly Mistake<MistakeCode>[];
}

export function refusalReader<Code extends string = string, MistakeCode extends string = Code>(): RefusalReader<Code, MistakeCode> {
    return {
        codeOf: (error) => (error instanceof ApiError ? (error.code as Code | null) : null),
        mistakesOf: (error) => (error instanceof ApiError ? (error.mistakes as readonly Mistake<MistakeCode>[]) : []),
    };
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

const MOST_RETRIES = 2;

export function retryUnlessRefused(failures: number, error: unknown): boolean {
    const refused = error instanceof ApiError && error.status >= 400 && error.status < 500;
    return !refused && failures < MOST_RETRIES;
}

type Answer<Data> = Promise<{ data?: Data; error?: unknown; response: Response }>;

export async function dataOf<Data>(call: Answer<Data>): Promise<[Data] extends [never] ? undefined : Data> {
    const { data, error, response } = await call;
    if (!response.ok) throw new ApiError(response.status, error, response.statusText);
    return data as [Data] extends [never] ? undefined : Data;
}
