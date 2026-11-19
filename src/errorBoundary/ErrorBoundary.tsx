import { Component, type ErrorInfo, type ReactNode } from "react";

import { ErrorScreen } from "./ErrorScreen.js";

export interface Failure {
    error: unknown;
    retry: () => void;
}

interface Props {
    children: ReactNode;
    fallback?: (failure: Failure) => ReactNode;
    onError?: (error: unknown, info: ErrorInfo) => void;
}

interface State {
    caught: { error: unknown } | null;
}

function screenOf({ error, retry }: Failure) {
    return <ErrorScreen error={error} onRetry={retry} />;
}

export class ErrorBoundary extends Component<Props, State> {
    override state: State = { caught: null };

    static getDerivedStateFromError(error: unknown): State {
        return { caught: { error } };
    }

    override componentDidCatch(error: unknown, info: ErrorInfo) {
        this.props.onError?.(error, info);
    }

    retry = () => {
        this.setState({ caught: null });
    };

    override render() {
        const { caught } = this.state;
        if (caught === null) return this.props.children;
        return (this.props.fallback ?? screenOf)({ error: caught.error, retry: this.retry });
    }
}
