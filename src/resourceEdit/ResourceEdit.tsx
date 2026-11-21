import { useRef, useState, type SubmitEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "../alert/Alert.js";
import type { Mistake } from "../apiClient/apiClient.js";
import { Anchor } from "../anchor/Anchor.js";
import { Button } from "../button/Button.js";
import { ConfirmDialog } from "../dialog/ConfirmDialog.js";
import { MistakeList } from "../mistakeList/MistakeList.js";
import { Page } from "../page/Page.js";
import { Paper } from "../paper/Paper.js";
import { Spinner } from "../spinner/Spinner.js";
import { StickyActions } from "../stickyActions/StickyActions.js";

export interface Deletion {
    onDelete: () => unknown;
    question?: string;
    consequence?: ReactNode;
    blocked?: string | null;
    failure?: string | null;
    label?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    pendingLabel?: string;
}

function DeleteAction({ deletion, title }: { deletion: Deletion; title: string }) {
    const {
        onDelete,
        question = `Delete ${title}?`,
        consequence = "This cannot be undone.",
        blocked = null,
        failure = null,
        label = "Delete",
        confirmLabel = label,
        cancelLabel = "Keep it",
        pendingLabel = "Deleting…",
    } = deletion;
    const [asking, setAsking] = useState(false);
    return (
        <div className="flex flex-col gap-2">
            {failure !== null && <Alert variant="destructive">{failure}</Alert>}
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="destructive"
                    disabled={blocked !== null}
                    onClick={() => {
                        setAsking(true);
                    }}
                >
                    {label}
                </Button>
                {blocked !== null && <span className="text-sm text-muted-foreground">{blocked}</span>}
            </div>
            <ConfirmDialog
                open={asking}
                onOpenChange={setAsking}
                title={question}
                description={consequence}
                variant="destructive"
                confirmLabel={confirmLabel}
                cancelLabel={cancelLabel}
                pendingLabel={pendingLabel}
                onConfirm={onDelete}
            />
        </div>
    );
}

function Refusal({ refusal, mistakes }: { refusal: string | null; mistakes: readonly Mistake[] }) {
    if (refusal === null && mistakes.length === 0) return null;
    return (
        <Alert variant="destructive" className="flex flex-col gap-1">
            {refusal !== null && <span>{refusal}</span>}
            <MistakeList mistakes={mistakes} />
        </Alert>
    );
}

type Submission =
    | { action: (formData: FormData) => void | Promise<void>; onSubmit?: never; saving?: never }
    | { action?: never; onSubmit?: () => void; saving?: boolean };

function useSubmission(action: Submission["action"], onSubmit: Submission["onSubmit"]) {
    const submitting = useRef(false);
    if (action !== undefined) {
        return {
            action: async (formData: FormData) => {
                if (submitting.current) return;
                submitting.current = true;
                try {
                    await action(formData);
                } finally {
                    submitting.current = false;
                }
            },
        };
    }
    if (onSubmit === undefined) return null;
    return {
        onSubmit: (event: SubmitEvent<HTMLFormElement>) => {
            event.preventDefault();
            onSubmit();
        },
    };
}

function SaveButton({ saving, label, pendingLabel }: { saving: boolean; label: string; pendingLabel: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={saving || pending} aria-busy={pending}>
            {pending ? pendingLabel : label}
        </Button>
    );
}

export function ResourceEdit({
    title,
    backHref,
    backLabel = "Back to the list",
    titleAside,
    actions,
    width = "reading",
    ready = true,
    failure = null,
    loadingLabel = "Loading…",
    above,
    below,
    action,
    onSubmit,
    saving = false,
    saveLabel = "Save",
    pendingLabel = "Saving…",
    onCancel,
    cancelLabel = "Cancel",
    footerActions,
    refusal = null,
    mistakes = [],
    deletion,
    children,
}: {
    title: string;
    backHref?: string;
    backLabel?: string;
    titleAside?: ReactNode;
    actions?: ReactNode;
    width?: "full" | "reading";
    ready?: boolean;
    failure?: string | null;
    loadingLabel?: string;
    above?: ReactNode;
    below?: ReactNode;
    saveLabel?: string;
    pendingLabel?: string;
    onCancel?: () => void;
    cancelLabel?: string;
    footerActions?: ReactNode;
    refusal?: string | null;
    mistakes?: readonly Mistake[];
    deletion?: Deletion;
    children: ReactNode;
} & Submission) {
    const submission = useSubmission(action, onSubmit);
    const way =
        backHref === undefined ? null : (
            <div className="flex items-center gap-1 text-sm">
                <span aria-hidden="true" className="text-anchor">
                    ←
                </span>
                <Anchor href={backHref}>{backLabel}</Anchor>
            </div>
        );
    const screen = () => {
        if (failure !== null) return <Alert variant="destructive">{failure}</Alert>;
        if (!ready) return <Spinner size="sm" label={loadingLabel} />;
        return (
            <Page title={title} titleAside={titleAside} actions={actions} width={width}>
                {above}
                {submission === null ? (
                    children
                ) : (
                    <Paper>
                        <form aria-label={title} className="flex flex-col gap-4" {...submission}>
                            {children}
                            <Refusal refusal={refusal} mistakes={mistakes} />
                            <StickyActions>
                                <SaveButton saving={saving} label={saveLabel} pendingLabel={pendingLabel} />
                                {footerActions}
                                {onCancel !== undefined && (
                                    <Button type="button" variant="outline" onClick={onCancel}>
                                        {cancelLabel}
                                    </Button>
                                )}
                            </StickyActions>
                        </form>
                    </Paper>
                )}
                {deletion !== undefined && <DeleteAction deletion={deletion} title={title} />}
                {below}
            </Page>
        );
    };
    return (
        <div className="flex flex-col gap-4">
            {way}
            {screen()}
        </div>
    );
}
