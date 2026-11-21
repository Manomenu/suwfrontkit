import { ToggleGroup } from "radix-ui";

export function SegmentedControl<Value extends string>({
    label,
    options,
    value,
    onValueChange,
    disabled = false,
}: {
    label: string;
    options: readonly { value: Value; label: string }[];
    value: Value;
    onValueChange: (value: Value) => void;
    disabled?: boolean;
}) {
    return (
        <ToggleGroup.Root
            type="single"
            aria-label={label}
            value={value}
            disabled={disabled}
            onValueChange={(next) => {
                const chosen = options.find((option) => option.value === next);
                if (chosen !== undefined) onValueChange(chosen.value);
            }}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md border border-input bg-secondary p-1"
        >
            {options.map((option) => (
                <ToggleGroup.Item
                    key={option.value}
                    value={option.value}
                    className="h-7 cursor-pointer rounded-sm px-3 text-[13px] font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-foreground"
                >
                    {option.label}
                </ToggleGroup.Item>
            ))}
        </ToggleGroup.Root>
    );
}
