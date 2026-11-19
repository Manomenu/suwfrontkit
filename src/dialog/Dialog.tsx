import type { ReactNode } from "react";
import { Dialog as Primitive } from "radix-ui";

import { Paper } from "../paper/Paper.js";
import { actionsClassName, contentClassName, descriptionClassName, overlayClassName, titleClassName, useReturnFocus } from "./frame.js";

export function Dialog({
    open,
    onOpenChange,
    title,
    description,
    actions,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
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
                    <Paper className={contentClassName}>
                        <Primitive.Title className={titleClassName}>{title}</Primitive.Title>
                        {description !== undefined && (
                            <Primitive.Description className={descriptionClassName}>{description}</Primitive.Description>
                        )}
                        {children}
                        {actions !== undefined && <div className={actionsClassName}>{actions}</div>}
                    </Paper>
                </Primitive.Content>
            </Primitive.Portal>
        </Primitive.Root>
    );
}
