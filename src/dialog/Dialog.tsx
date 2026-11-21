import type { ReactNode } from "react";
import { Dialog as Primitive } from "radix-ui";

import { cn } from "../classNames.js";
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

function CloseButton({ label }: { label: string }) {
    return (
        <Primitive.Close
            aria-label={label}
            className="-mt-1 -mr-2 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
            <svg
                viewBox="0 0 16 16"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                aria-hidden="true"
            >
                <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
        </Primitive.Close>
    );
}

export function Dialog({
    open,
    onOpenChange,
    title,
    description,
    actions,
    width = "default",
    closable = false,
    closeLabel = "Close",
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
    width?: DialogWidth;
    closable?: boolean;
    closeLabel?: string;
    children?: ReactNode;
}) {
    const returnFocus = useReturnFocus(open);
    return (
        <Primitive.Root open={open} onOpenChange={onOpenChange}>
            <Primitive.Portal>
                <Primitive.Overlay className={overlayClassName} />
                <Primitive.Content
                    asChild
                    onCloseAutoFocus={returnFocus}
                    {...(description === undefined && { "aria-describedby": undefined })}
                >
                    <Paper className={contentClassName(width)}>
                        <div className="flex items-start gap-2">
                            <Primitive.Title className={cn(titleClassName, "min-w-0 flex-1")}>{title}</Primitive.Title>
                            {closable && <CloseButton label={closeLabel} />}
                        </div>
                        {description !== undefined && (
                            <Primitive.Description className={descriptionClassName}>{description}</Primitive.Description>
                        )}
                        {children !== undefined && <DialogBody>{children}</DialogBody>}
                        {actions !== undefined && <div className={actionsClassName}>{actions}</div>}
                    </Paper>
                </Primitive.Content>
            </Primitive.Portal>
        </Primitive.Root>
    );
}
