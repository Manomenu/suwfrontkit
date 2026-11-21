import { expect, it } from "vitest";

import { readServerSentEvents, type ServerSentEvent } from "./serverSentEvents.js";

interface Events {
    part: { text: string };
    done: { total: number };
}

const encoder = new TextEncoder();

function streamOf(...chunks: (string | Uint8Array)[]): ReadableStream<Uint8Array> {
    return new ReadableStream({
        start(controller) {
            for (const chunk of chunks) controller.enqueue(typeof chunk === "string" ? encoder.encode(chunk) : chunk);
            controller.close();
        },
    });
}

async function all(body: ReadableStream<Uint8Array>): Promise<ServerSentEvent<Events>[]> {
    const events: ServerSentEvent<Events>[] = [];
    for await (const event of readServerSentEvents<Events>(body)) events.push(event);
    return events;
}

it("gives each event in order, its name and its data read as JSON", async () => {
    const events = await all(streamOf('event: part\ndata: {"text":"We need "}\n\n', 'event: done\ndata: {"total":2}\n\n'));

    expect(events).toEqual([
        { name: "part", data: { text: "We need " } },
        { name: "done", data: { total: 2 } },
    ]);
});

it("reads an event split between chunks, and a character split between chunks", async () => {
    const bytes = encoder.encode('event: part\ndata: {"text":"żółw"}\n\n');

    const events = await all(streamOf(bytes.slice(0, 7), bytes.slice(7, 27), bytes.slice(27)));

    expect(events).toEqual([{ name: "part", data: { text: "żółw" } }]);
});

it("reads lines ended with CRLF, also when CR and LF arrive in different chunks", async () => {
    const events = await all(streamOf('event: part\r\ndata: {"text":"x"}\r', "\n\r\n"));

    expect(events).toEqual([{ name: "part", data: { text: "x" } }]);
});

it("skips comments and events without data, and joins the lines of multi-line data", async () => {
    const events = await all(streamOf(": keep alive\n\n", "event: part\n\n", 'event: part\ndata: {"text":\ndata: "two lines"}\n\n'));

    expect(events).toEqual([{ name: "part", data: { text: "two lines" } }]);
});

it("names an event without an event line message, as the standard says", async () => {
    const events = await all(streamOf('data: {"text":"plain"}\n\n'));

    expect(events).toEqual([{ name: "message", data: { text: "plain" } }]);
});

it("drops an event cut off by the end of the stream", async () => {
    const events = await all(streamOf('event: part\ndata: {"text":"whole"}\n\n', 'event: part\ndata: {"text":"cu'));

    expect(events).toEqual([{ name: "part", data: { text: "whole" } }]);
});

it("passes on the error of a connection that drops while reading", async () => {
    const dropped = new ReadableStream<Uint8Array>({
        pull(controller) {
            controller.error(new TypeError("network error"));
        },
    });

    await expect(all(dropped)).rejects.toThrow("network error");
});

it("cancels the stream when the reader stops early, so the connection is closed", async () => {
    let cancelled = false;
    const endless = new ReadableStream<Uint8Array>({
        pull(controller) {
            controller.enqueue(encoder.encode('event: part\ndata: {"text":"again"}\n\n'));
        },
        cancel() {
            cancelled = true;
        },
    });

    for await (const event of readServerSentEvents<Events>(endless)) {
        if (event.name === "part") break;
    }

    expect(cancelled).toBe(true);
});
