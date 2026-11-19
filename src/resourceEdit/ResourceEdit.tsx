import { useState, type ReactElement, type ReactNode } from "react";

import { Alert } from "../alert/Alert.js";
import { Anchor } from "../anchor/Anchor.js";
import { Button } from "../button/Button.js";
import { Page } from "../page/Page.js";
import { Paper } from "../paper/Paper.js";
import { StickyActions } from "../stickyActions/StickyActions.js";

export interface Deletion {
    onDelete: () => void;
    confirm: (answer: { onConfirm: () => void; onCancel: () => void }) => ReactNode;
    blocked?: string | null;
    failure?: string | null;
    label?: string;
}

function DeleteAction({ deletion }: { deletion: Deletion }) {
    const { onDelete, confirm, blocked = null, failure = null, label = "Delete" } = deletion;
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
            {asking &&
                confirm({
                    onConfirm: () => {
                        setAsking(false);
                        onDelete();
                    },
                    onCancel: () => {
                        setAsking(false);
                    },
                })}
        </div>
    );
}

function Refusal({ refusal, mistakes }: { refusal: string | null; mistakes: string[] }) {
    if (refusal === null && mistakes.length === 0) return null;
    return (
        <Alert variant="destructive" className="flex flex-col gap-1">
            {refusal !== null && <span>{refusal}</span>}
            {mistakes.length > 0 && (
                <ul className="list-disc pl-4">
                    {mistakes.map((mistake) => (
                        <li key={mistake}>{mistake}</li>
                    ))}
                </ul>
            )}
        </Alert>
    );
}

export function ResourceEdit({
    title,
    back,
    backLabel = "Back to the list",
    titleAside,
    actions,
    width = "reading",
    ready = true,
    failure = null,
    loadingLabel = "Loading…",
    above,
    below,
    onSubmit,
    saving = false,
    saveLabel = "Save",
    onCancel,
    cancelLabel = "Cancel",
    footerActions,
    refusal = null,
    mistakes = [],
    deletion,
    children,
}: {
    title: string;
    back?: (label: string) => ReactElement;
    backLabel?: string;
    titleAside?: ReactNode;
    actions?: ReactNode;
    width?: "full" | "reading";
    ready?: boolean;
    failure?: string | null;
    loadingLabel?: string;
    above?: ReactNode;
    below?: ReactNode;
    onSubmit?: () => void;
    saving?: boolean;
    saveLabel?: string;
    onCancel?: () => void;
    cancelLabel?: string;
    footerActions?: ReactNode;
    refusal?: string | null;
    mistakes?: string[];
    deletion?: Deletion;
    children: ReactNode;
}) {
    const way =
        back === undefined ? null : (
            <div className="flex items-center gap-1 text-sm">
                <span aria-hidden="true" className="text-anchor">
                    ←
                </span>
                <Anchor asChild>{back(backLabel)}</Anchor>
            </div>
        );
    const screen = () => {
        if (failure !== null) return <Alert variant="destructive">{failure}</Alert>;
        if (!ready) return <p className="text-muted-foreground">{loadingLabel}</p>;
        return (
            <Page title={title} titleAside={titleAside} actions={actions} width={width}>
                {above}
                {onSubmit === undefined ? (
                    children
                ) : (
                    <Paper>
                        <form
                            aria-label={title}
                            className="flex flex-col gap-4"
                            onSubmit={(event) => {
                                event.preventDefault();
                                onSubmit();
                            }}
                        >
                            {children}
                            <Refusal refusal={refusal} mistakes={mistakes} />
                            <StickyActions>
                                <Button type="submit" disabled={saving}>
                                    {saveLabel}
                                </Button>
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
                {deletion !== undefined && <DeleteAction deletion={deletion} />}
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
