import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { cn } from "../classNames.js";
import { choicesWith, matching, stepped, toggled, type Choice } from "./choices.js";

export function MultiSelect({
    label,
    options,
    value,
    onValueChange,
    disabled = false,
    className,
    id,
    "aria-invalid": invalid,
    "aria-describedby": describedBy,
    placeholder = "Search…",
    emptyLabel = "Nothing found",
    clearLabel = "Clear",
    removeLabel = (choice) => `Remove ${choice}`,
}: {
    label: string;
    options: readonly Choice[];
    value: readonly string[];
    onValueChange: (value: string[]) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
    placeholder?: string;
    emptyLabel?: string;
    clearLabel?: string;
    removeLabel?: (choice: string) => string;
}) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<string | null>(null);
    const input = useRef<HTMLInputElement>(null);
    const listId = useId();
    const choices = choicesWith(options, value);
    const shown = open ? matching(choices, query) : [];
    const expanded = shown.length > 0;
    const optionId = (choice: string) => `${listId}-${String(choices.findIndex((each) => each.value === choice))}`;
    const activeShown = expanded && shown.some((choice) => choice.value === active) ? active : null;

    useEffect(() => {
        if (activeShown !== null) document.getElementById(optionId(activeShown))?.scrollIntoView({ block: "nearest" });
    });

    const change = (next: string[]) => {
        onValueChange(next);
        input.current?.focus();
    };
    const toggle = (choice: string) => {
        change(toggled(choices, value, choice));
        setQuery("");
        setActive(choice);
    };
    const show = (step: 1 | -1) => {
        const all = matching(choices, query);
        setOpen(true);
        setActive(stepped(all, open ? activeShown : null, step));
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        switch (event.key) {
            case "ArrowDown":
            case "ArrowUp":
                event.preventDefault();
                show(event.key === "ArrowDown" ? 1 : -1);
                break;
            case "Enter":
                if (activeShown !== null) {
                    event.preventDefault();
                    toggle(activeShown);
                }
                break;
            case "Escape":
                if (open) {
                    event.stopPropagation();
                    setOpen(false);
                } else setQuery("");
                break;
            case "Backspace": {
                const last = value.at(-1);
                if (query === "" && last !== undefined) change(value.slice(0, -1));
                break;
            }
            case "Tab":
                setOpen(false);
                break;
        }
    };

    return (
        <div className={cn("relative w-full", className)}>
            <div
                data-slot="multi-select"
                onClick={(event) => {
                    if (disabled || (event.target instanceof Element && event.target.closest("button") !== null)) return;
                    input.current?.focus();
                    setOpen(true);
                }}
                className="flex min-h-9 w-full items-start gap-1 rounded-md border border-input bg-secondary py-[3px] pr-[3px] pl-2 text-sm text-foreground transition-colors focus-within:border-primary has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-background has-[input[aria-invalid=true]]:border-destructive"
            >
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                    {value.map((chosen) => {
                        const name = choices.find((choice) => choice.value === chosen)?.label ?? chosen;
                        return (
                            <span
                                key={chosen}
                                className={cn(
                                    "inline-flex h-6 items-center gap-0.5 rounded-full bg-accent pl-2.5 text-xs font-medium text-accent-foreground",
                                    disabled ? "pr-2.5" : "pr-0.5",
                                )}
                            >
                                {name}
                                {!disabled && (
                                    <button
                                        type="button"
                                        aria-label={removeLabel(name)}
                                        onClick={() => {
                                            change(value.filter((each) => each !== chosen));
                                        }}
                                        className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                                    >
                                        <Cross />
                                    </button>
                                )}
                            </span>
                        );
                    })}
                    <input
                        ref={input}
                        id={id}
                        role="combobox"
                        aria-label={label}
                        aria-expanded={expanded}
                        aria-controls={listId}
                        aria-autocomplete="list"
                        aria-activedescendant={activeShown === null ? undefined : optionId(activeShown)}
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        autoComplete="off"
                        disabled={disabled}
                        value={query}
                        placeholder={value.length === 0 ? placeholder : undefined}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setOpen(true);
                            setActive(matching(choices, event.target.value)[0]?.value ?? null);
                        }}
                        onKeyDown={onKeyDown}
                        onBlur={() => {
                            setOpen(false);
                            setQuery("");
                        }}
                        className="h-7 min-w-16 flex-1 bg-transparent px-1 outline-none disabled:cursor-not-allowed"
                    />
                </div>
                {value.length > 0 && !disabled && (
                    <button
                        type="button"
                        aria-label={clearLabel}
                        onClick={() => {
                            setQuery("");
                            change([]);
                        }}
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                        <Cross />
                    </button>
                )}
            </div>
            <ul
                id={listId}
                role="listbox"
                aria-label={label}
                aria-multiselectable="true"
                hidden={!expanded}
                className="absolute inset-x-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-secondary p-1 text-sm shadow-md"
            >
                {shown.map((choice) => {
                    const selected = value.includes(choice.value);
                    return (
                        <li
                            key={choice.value}
                            id={optionId(choice.value)}
                            role="option"
                            aria-selected={selected}
                            data-active={choice.value === activeShown || undefined}
                            onMouseDown={(event) => {
                                event.preventDefault();
                            }}
                            onMouseMove={() => {
                                setActive(choice.value);
                            }}
                            onClick={() => {
                                toggle(choice.value);
                            }}
                            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-secondary-foreground data-active:bg-accent"
                        >
                            <svg
                                viewBox="0 0 16 16"
                                className={cn("size-3.5 shrink-0 text-primary", !selected && "invisible")}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M3.5 8.5l3 3 6-7" />
                            </svg>
                            {choice.label}
                        </li>
                    );
                })}
            </ul>
            {open && query.trim() !== "" && !expanded && (
                <p
                    role="status"
                    className="absolute inset-x-0 top-full z-50 mt-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground shadow-md"
                >
                    {emptyLabel}
                </p>
            )}
        </div>
    );
}

function Cross() {
    return (
        <svg
            viewBox="0 0 16 16"
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
    );
}
