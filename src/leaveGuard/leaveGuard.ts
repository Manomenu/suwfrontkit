import { useEffect, useSyncExternalStore } from "react";

const DISCARD_QUESTION = "Discard the changes you have not saved?";

let question: string | null = null;
const listeners = new Set<() => void>();

function ask(next: string | null) {
    question = next;
    for (const listener of listeners) listener();
}

export function onLeaveGuardChange(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function isLeaveGuardActive(): boolean {
    return question !== null;
}

export function useLeaveGuard(active: boolean, message: string = DISCARD_QUESTION) {
    useEffect(() => {
        if (!active) return;
        const warn = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };
        ask(message);
        window.addEventListener("beforeunload", warn);
        return () => {
            ask(null);
            window.removeEventListener("beforeunload", warn);
        };
    }, [active, message]);
}

export function useLeaveGuardActive(): boolean {
    return useSyncExternalStore(onLeaveGuardChange, isLeaveGuardActive, () => false);
}

export function mayLeave(): boolean {
    return question === null || window.confirm(question);
}
