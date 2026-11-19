import { useId, useState } from "react";
import { Tooltip } from "radix-ui";

export function InfoTip({ about, help }: { about: string; help: string }) {
    const [open, setOpen] = useState(false);
    const descriptionId = useId();
    return (
        <Tooltip.Provider delayDuration={150}>
            <Tooltip.Root open={open} onOpenChange={setOpen}>
                <Tooltip.Trigger asChild>
                    <button
                        type="button"
                        aria-describedby={descriptionId}
                        onClick={(event) => {
                            event.preventDefault();
                            setOpen(true);
                        }}
                        className="inline-flex size-5 shrink-0 cursor-help items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                        <span className="sr-only">About {about}</span>
                        <svg
                            viewBox="0 0 16 16"
                            className="size-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            aria-hidden="true"
                        >
                            <circle cx="8" cy="8" r="6.75" />
                            <path d="M8 7.25v4M8 4.5v.5" strokeLinecap="round" />
                        </svg>
                        <span id={descriptionId} hidden>
                            {help}
                        </span>
                    </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        side="right"
                        sideOffset={6}
                        collisionPadding={8}
                        className="z-[60] max-w-80 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-normal text-secondary-foreground shadow-md"
                    >
                        {help}
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
}
