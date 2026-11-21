import { useTransition, type ReactNode } from "react";
import { AlertDialog } from "radix-ui";

import { Button } from "../button/Button.js";
import { Paper } from "../paper/Paper.js";
import { DialogBody } from "./DialogBody.js";
import {
    actionsClassName,
    contentClassName,
    descriptionClassName,
    overlayClassName,
    titleClassName,
    useReturnFocus,
    type DialogWidth,
} from "./frame.js";

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    onConfirm,
    variant = "default",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    pendingLabel = "Working…",
    confirmDisabled = false,
    width = "default",
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: ReactNode;
    children?: ReactNode;
    onConfirm: () => unknown;
    variant?: "default" | "destructive";
    confirmLabel?: string;
    cancelLabel?: string;
    pendingLabel?: string;
    confirmDisabled?: boolean;
    width?: DialogWidth;
}) {
    const [pending, startTransition] = useTransition();
    const returnFocus = useReturnFocus(open);

    const confirm = () => {
        if (pending || confirmDisabled) return;
        const outcome = onConfirm();
        if (!(outcome instanceof Promise)) {
            onOpenChange(false);
            return;
        }
        startTransition(async () => {
            try {
                await outcome;
            } catch {
                return;
            }
            startTransition(() => {
                onOpenChange(false);
            });
        });
    };

    return (
        <AlertDialog.Root
            open={open}
            onOpenChange={(next) => {
                if (!pending) onOpenChange(next);
            }}
        >
            <AlertDialog.Portal>
                <AlertDialog.Overlay className={overlayClassName} />
                <AlertDialog.Content
                    asChild
                    onCloseAutoFocus={returnFocus}
                    {...(description === undefined && { "aria-describedby": undefined })}
                >
                    <Paper className={contentClassName(width)}>
                        <AlertDialog.Title className={titleClassName}>{title}</AlertDialog.Title>
                        {description !== undefined && (
                            <AlertDialog.Description className={descriptionClassName}>{description}</AlertDialog.Description>
                        )}
                        {children !== undefined && <DialogBody>{children}</DialogBody>}
                        <div className={actionsClassName}>
                            <AlertDialog.Cancel asChild>
                                <Button type="button" variant="outline" disabled={pending}>
                                    {cancelLabel}
                                </Button>
                            </AlertDialog.Cancel>
                            <Button
                                type="button"
                                variant={variant}
                                aria-busy={pending}
                                aria-disabled={pending}
                                disabled={confirmDisabled}
                                onClick={confirm}
                            >
                                {pending ? pendingLabel : confirmLabel}
                            </Button>
                        </div>
                    </Paper>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
}
