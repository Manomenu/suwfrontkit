import { useId, useRef } from "react";

import { Badge } from "../badge/Badge.js";
import { Button } from "../button/Button.js";
import { Label } from "../label/Label.js";
import { chosenOf, toggled } from "./selection.js";
import { ToggleChip } from "./ToggleChip.js";

export function ChipFilter({
    label,
    options,
    value,
    onValueChange,
    disabled = false,
    clearLabel = "Clear",
    countLabel = (count) => `${count} selected`,
}: {
    label: string;
    options: readonly { value: string; label: string }[];
    value: readonly string[];
    onValueChange: (value: string[]) => void;
    disabled?: boolean;
    clearLabel?: string;
    countLabel?: (count: number) => string;
}) {
    const labelId = useId();
    const group = useRef<HTMLDivElement>(null);
    const values = options.map((option) => option.value);
    const count = chosenOf(values, value).length;
    return (
        <div className="flex flex-col gap-2">
            <div className="flex min-h-[30px] items-center gap-3">
                <Label id={labelId}>{label}</Label>
                {count > 0 && (
                    <>
                        <Badge>{countLabel(count)}</Badge>
                        <Button
                            type="button"
                            variant="link"
                            size="xs"
                            disabled={disabled}
                            onClick={() => {
                                onValueChange([]);
                                group.current?.querySelector("button")?.focus();
                            }}
                        >
                            {clearLabel}
                        </Button>
                    </>
                )}
            </div>
            <div ref={group} role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
                {options.map((option) => (
                    <ToggleChip
                        key={option.value}
                        disabled={disabled}
                        pressed={value.includes(option.value)}
                        onPressedChange={() => {
                            onValueChange(toggled(values, value, option.value));
                        }}
                    >
                        {option.label}
                    </ToggleChip>
                ))}
            </div>
        </div>
    );
}
