import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { Paper } from "../paper/Paper.js";
import { readServerSentEvents } from "./serverSentEvents.js";

interface ReplyEvents {
    part: { text: string };
    done: { words: number };
}

const encoder = new TextEncoder();

function reply(): ReadableStream<Uint8Array> {
    const chunks = [
        'event: part\ndata: {"text":"We need the "}\n\n',
        'event: part\ndata: {"text":"number of the invoice."}\n\nevent: done\ndata: {"words":6}\n\n',
    ];
    return new ReadableStream({
        start(controller) {
            for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
            controller.close();
        },
    });
}

function StreamedReply() {
    const [text, setText] = useState("");
    const [words, setWords] = useState<number | null>(null);
    useEffect(() => {
        const run = { stopped: false };
        void (async () => {
            for await (const event of readServerSentEvents<ReplyEvents>(reply())) {
                if (run.stopped) return;
                if (event.name === "part") setText((shown) => shown + event.data.text);
                else setWords(event.data.words);
            }
        })();
        return () => {
            run.stopped = true;
        };
    }, []);
    return (
        <Paper className="flex max-w-reading flex-col gap-2">
            <p>{text}</p>
            <p className="text-sm text-muted-foreground">{words === null ? "Writing…" : `Done, ${String(words)} words.`}</p>
        </Paper>
    );
}

const meta = { component: StreamedReply, title: "ServerSentEvents" } satisfies Meta<typeof StreamedReply>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ReplyReadPartByPart: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText("Done, 6 words.")).toBeVisible();
        await expect(canvas.getByText("We need the number of the invoice.")).toBeVisible();
    },
};
