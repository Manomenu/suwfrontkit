import { Alert } from "../alert/Alert.js";
import { Button } from "../button/Button.js";

function messageOf(error: unknown): string {
    if (error instanceof Error) return error.message;
    return typeof error === "string" ? error : "";
}

export function ErrorScreen({
    error,
    onRetry,
    title = "Something went wrong",
    retryLabel = "Try again",
}: {
    error: unknown;
    onRetry: () => void;
    title?: string;
    retryLabel?: string;
}) {
    const message = messageOf(error);
    return (
        <Alert variant="destructive" className="flex flex-col items-start gap-2">
            <p className="font-semibold">{title}</p>
            {message !== "" && <p className="wrap-anywhere">{message}</p>}
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                {retryLabel}
            </Button>
        </Alert>
    );
}
