import { describe, expect, expectTypeOf, it, vi } from "vitest";

import { ApiError, createApi, dataOf, refusalReader, type Mistake } from "./apiClient.js";

type RefusalCode = "procedure.invalid" | "procedure.loop" | "step.recipientMissing" | "resource.stale";

const { codeOf, mistakesOf } = refusalReader();

const refusal = {
    type: "https://tools.ietf.org/html/rfc9110#section-15.5.21",
    title: "The procedure cannot be saved",
    status: 422,
    detail: "2 mistake(s) in `mistakes`: fix each as its `fix` says, then try again.",
    code: "procedure.invalid",
    mistakes: [
        {
            code: "procedure.loop",
            message: "Step approve leads back to itself.",
            fix: "Point approve at a later step.",
            at: "approve",
            stage: "save",
            related: [{ kind: "step", id: "notify" }],
        },
        { code: "step.recipientMissing", message: "Step notify has no recipient.", fix: "Choose who gets the message." },
    ],
};

async function refusedWith(status: number, body: string | null, contentType = "application/problem+json"): Promise<unknown> {
    vi.stubGlobal("fetch", () => Promise.resolve(new Response(body, { status, headers: { "content-type": contentType } })));
    const api = createApi<Record<string, never>>();
    try {
        await dataOf(api.GET("/api/procedures/7" as never));
    } catch (error) {
        return error;
    } finally {
        vi.unstubAllGlobals();
    }
    throw new Error("the call did not fail");
}

describe("reading a refusal", () => {
    it("AC-refusal-reading-1: gives the refusal's code and its mistakes, with at and the mistake's other members kept", () => {
        const error = new ApiError(422, refusal);

        expect(error.code).toBe("procedure.invalid");
        expect(error.mistakes).toEqual([
            {
                code: "procedure.loop",
                message: "Step approve leads back to itself.",
                fix: "Point approve at a later step.",
                at: "approve",
                stage: "save",
                related: [{ kind: "step", id: "notify" }],
            },
            { code: "step.recipientMissing", message: "Step notify has no recipient.", fix: "Choose who gets the message." },
        ]);
        expect(codeOf(error)).toBe("procedure.invalid");
        expect(mistakesOf(error)).toEqual(error.mistakes);
    });

    it("AC-refusal-reading-1: reads a refusal that came over the wire, and one with a code only", async () => {
        const error = await refusedWith(422, JSON.stringify(refusal));
        const stale = await refusedWith(
            409,
            JSON.stringify({ title: "Conflict", status: 409, detail: "Reload it.", code: "resource.stale" }),
        );

        expect(codeOf(error)).toBe("procedure.invalid");
        expect(mistakesOf(error).map((mistake) => mistake.at)).toEqual(["approve", undefined]);
        expect(codeOf(stale)).toBe("resource.stale");
        expect(mistakesOf(stale)).toEqual([]);
    });

    it("AC-refusal-reading-2: an answer without a code gives no code and no mistakes, and reading never throws", async () => {
        const failures = [
            await refusedWith(503, JSON.stringify({ title: "Service Unavailable", status: 503, detail: "The database does not answer." })),
            await refusedWith(500, JSON.stringify({ title: "Error", status: 500, code: "", mistakes: "many" })),
            await refusedWith(502, "<html>Bad Gateway</html>", "text/html"),
            await refusedWith(500, null),
            new TypeError("Failed to fetch"),
            "not even an error",
            null,
        ];

        for (const failure of failures) {
            expect(codeOf(failure)).toBeNull();
            expect(mistakesOf(failure)).toEqual([]);
        }
        expect(new ApiError(503, null).code).toBeNull();
        expect(new ApiError(503, null).mistakes).toEqual([]);
    });

    it("AC-refusal-reading-3: a mistake without a code, a message or a fix is left out, never shown without its fix", () => {
        const error = new ApiError(422, {
            code: "procedure.invalid",
            mistakes: [
                { code: "procedure.loop", message: "Step approve leads back to itself." },
                { code: "procedure.loop", message: "Step approve leads back to itself.", fix: "" },
                { message: "No code.", fix: "Fix it." },
                { code: "step.recipientMissing", fix: "Choose who gets the message." },
                "a mistake as text",
                null,
                { code: "step.recipientMissing", message: "Step notify has no recipient.", fix: "Choose who gets the message.", at: 7 },
            ],
        });

        expect(error.code).toBe("procedure.invalid");
        expect(error.mistakes).toEqual([
            { code: "step.recipientMissing", message: "Step notify has no recipient.", fix: "Choose who gets the message." },
        ]);
    });

    it("AC-refusal-reading-4: an app reads the code and the mistakes' codes as its own enum, without a cast", () => {
        const error: unknown = new ApiError(422, refusal);

        const refusals = refusalReader<RefusalCode>();
        const code = refusals.codeOf(error);
        const mistakes = refusals.mistakesOf(error);

        expectTypeOf(code).toEqualTypeOf<RefusalCode | null>();
        expectTypeOf(mistakes).toEqualTypeOf<readonly Mistake<RefusalCode>[]>();
        expectTypeOf(mistakes[0]?.code).toEqualTypeOf<RefusalCode | undefined>();
        expect(code === "procedure.invalid" ? "fix the steps" : "try again").toBe("fix the steps");
    });

    it("AC-refusal-reading-4: an app whose mistakes have codes of their own reads them as a second enum, without a cast", () => {
        type MistakeCode = "step.missing" | "step.name.invalid";
        const error: unknown = new ApiError(422, refusal);

        const mistakes = refusalReader<RefusalCode, MistakeCode>().mistakesOf(error);

        expectTypeOf(mistakes[0]?.code).toEqualTypeOf<MistakeCode | undefined>();
    });
});
