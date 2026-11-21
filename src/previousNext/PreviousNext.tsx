import { useId } from "react";

import { Button } from "../button/Button.js";
import { cn } from "../classNames.js";

const TEXT = { sm: "text-sm", xs: "text-xs" } as const;

export function PreviousNext({
    label,
    counter,
    widestCounter,
    onPrevious,
    onNext,
    previousLabel = "Previous",
    nextLabel = "Next",
    previousDisabled = false,
    nextDisabled = false,
    reason = null,
    size = "sm",
    className,
    "aria-hidden": hidden,
}: {
    label: string;
    counter: string;
    widestCounter?: string;
    onPrevious: () => void;
    onNext: () => void;
    previousLabel?: string;
    nextLabel?: string;
    previousDisabled?: boolean;
    nextDisabled?: boolean;
    reason?: string | null;
    size?: keyof typeof TEXT;
    className?: string;
    "aria-hidden"?: boolean;
}) {
    const reasonId = useId();
    const explained = (disabled: boolean) => (disabled && reason !== null ? { "aria-describedby": reasonId, title: reason } : {});
    return (
        <div role="group" aria-label={label} aria-hidden={hidden} className={cn("flex items-center gap-2", TEXT[size], className)}>
            <Button
                type="button"
                variant="outline"
                size={size}
                disabled={previousDisabled}
                {...explained(previousDisabled)}
                onClick={onPrevious}
            >
                {previousLabel}
            </Button>
            <span className="inline-grid text-center whitespace-nowrap text-muted-foreground tabular-nums">
                <span data-counter aria-live="polite" className="[grid-area:1/1]">
                    {counter}
                </span>
                {widestCounter !== undefined && (
                    <span aria-hidden className="invisible [grid-area:1/1]">
                        {widestCounter}
                    </span>
                )}
            </span>
            <Button type="button" variant="outline" size={size} disabled={nextDisabled} {...explained(nextDisabled)} onClick={onNext}>
                {nextLabel}
            </Button>
            {reason !== null && (previousDisabled || nextDisabled) && (
                <span id={reasonId} className="text-muted-foreground">
                    {reason}
                </span>
            )}
        </div>
    );
}
