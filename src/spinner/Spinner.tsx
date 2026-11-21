import { cn } from "../classNames.js";

const SIZES = { xs: "size-[18px] border-2", sm: "size-[22px] border-2", md: "size-9 border-[3px]" } as const;

export function Spinner({ label, size = "md", className }: { label: string; size?: keyof typeof SIZES; className?: string }) {
    return (
        <span
            role="status"
            aria-label={label}
            className={cn(
                "inline-block shrink-0 rounded-full border-primary border-r-transparent motion-safe:animate-spin",
                SIZES[size],
                className,
            )}
        />
    );
}
