import type { ReactNode } from "react";

import { Alert } from "../alert/Alert.js";
import { Button } from "../button/Button.js";

function messageOf(error: unknown): string {
    if (error instanceof Error) return error.message;
    return typeof error === "string" ? error : "";
}

type Way = { onRetry: () => void; retryLabel?: string; actions?: never } | { actions: ReactNode; onRetry?: never; retryLabel?: never };

function WayOut({ way }: { way: Way }) {
    if (way.actions !== undefined) return <div className="flex flex-wrap items-center gap-4">{way.actions}</div>;
    return (
        <Button type="button" variant="outline" size="sm" onClick={way.onRetry}>
            {way.retryLabel ?? "Try again"}
        </Button>
    );
}

export function ErrorScreen({ error, title = "Something went wrong", ...way }: { error: unknown; title?: string } & Way) {
    const message = messageOf(error);
    return (
        <Alert variant="destructive" className="flex flex-col items-start gap-2">
            <p className="font-semibold">{title}</p>
            {message !== "" && <p className="wrap-anywhere">{message}</p>}
            <WayOut way={way} />
        </Alert>
    );
}
