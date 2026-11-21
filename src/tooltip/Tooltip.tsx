import type { ReactElement, ReactNode } from "react";
import { Tooltip as Primitive } from "radix-ui";

export function Tooltip({
    label,
    side = "top",
    disabled = false,
    children,
}: {
    label: ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    disabled?: boolean;
    children: ReactElement;
}) {
    if (disabled) return children;
    return (
        <Primitive.Provider delayDuration={150}>
            <Primitive.Root>
                <Primitive.Trigger asChild>{children}</Primitive.Trigger>
                <Primitive.Portal>
                    <Primitive.Content
                        side={side}
                        sideOffset={6}
                        collisionPadding={8}
                        className="z-[60] max-w-80 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-normal wrap-anywhere whitespace-pre-line text-secondary-foreground shadow-md"
                    >
                        {label}
                    </Primitive.Content>
                </Primitive.Portal>
            </Primitive.Root>
        </Primitive.Provider>
    );
}
