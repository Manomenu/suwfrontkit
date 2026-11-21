import type { ComponentProps, MouseEvent } from "react";

import { mayLeave } from "./leaveGuard.js";

function opensElsewhere(event: MouseEvent<HTMLAnchorElement>): boolean {
    const { target } = event.currentTarget;
    return (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        (target !== "" && target !== "_self") ||
        event.currentTarget.hasAttribute("download")
    );
}

export function GuardedLink({
    href,
    navigate,
    onClick,
    ...props
}: Omit<ComponentProps<"a">, "href"> & { href: string; navigate: (href: string) => void }) {
    return (
        <a
            href={href}
            {...props}
            onClick={(event) => {
                onClick?.(event);
                if (event.defaultPrevented || opensElsewhere(event)) return;
                event.preventDefault();
                if (mayLeave()) navigate(href);
            }}
        />
    );
}
