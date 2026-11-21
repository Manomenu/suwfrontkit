export type ServerSentEvent<Events extends object> = {
    [Name in keyof Events & string]: { name: Name; data: Events[Name] };
}[keyof Events & string];

const BLOCK_END = "\n\n";

function fieldOf(line: string): [string, string] {
    const colon = line.indexOf(":");
    if (colon === -1) return [line, ""];
    const value = line.slice(colon + 1);
    return [line.slice(0, colon), value.startsWith(" ") ? value.slice(1) : value];
}

function eventOf<Events extends object>(block: string): ServerSentEvent<Events> | null {
    let name = "message";
    const data: string[] = [];
    for (const line of block.split("\n")) {
        if (line.startsWith(":")) continue;
        const [field, value] = fieldOf(line);
        if (field === "event") name = value;
        if (field === "data") data.push(value);
    }
    if (data.length === 0) return null;
    return { name, data: JSON.parse(data.join("\n")) as unknown } as ServerSentEvent<Events>;
}

export async function* readServerSentEvents<Events extends object>(
    body: ReadableStream<Uint8Array>,
): AsyncGenerator<ServerSentEvent<Events>, void, undefined> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finished = false;
    try {
        for (let read = await reader.read(); !read.done; read = await reader.read()) {
            buffer = (buffer + decoder.decode(read.value, { stream: true })).replaceAll("\r\n", "\n");
            for (let end = buffer.indexOf(BLOCK_END); end !== -1; end = buffer.indexOf(BLOCK_END)) {
                const event = eventOf<Events>(buffer.slice(0, end));
                buffer = buffer.slice(end + BLOCK_END.length);
                if (event !== null) yield event;
            }
        }
        finished = true;
    } finally {
        if (!finished) await reader.cancel().catch(() => undefined);
        reader.releaseLock();
    }
}
