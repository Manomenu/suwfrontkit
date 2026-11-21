import type { ComponentProps } from "react";

import { useLinkClick } from "./LinkProvider.js";

export function GuardedLink({ href, onClick, ...props }: Omit<ComponentProps<"a">, "href"> & { href: string }) {
    return <a href={href} {...props} onClick={useLinkClick(onClick)} />;
}
