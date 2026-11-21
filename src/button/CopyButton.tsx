import { useState, type ComponentProps } from "react";

import { Button } from "./Button.js";

export function CopyButton({
    value,
    label,
    copiedLabel = "Copied",
    variant = "outline",
    size = "sm",
    ...props
}: Omit<ComponentProps<typeof Button>, "onClick" | "children" | "asChild"> & { value: string; label: string; copiedLabel?: string }) {
    const [copied, setCopied] = useState<string | null>(null);
    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            onClick={() => {
                navigator.clipboard.writeText(value).then(
                    () => {
                        setCopied(value);
                    },
                    () => undefined,
                );
            }}
            {...props}
        >
            {copied === value ? copiedLabel : label}
        </Button>
    );
}
