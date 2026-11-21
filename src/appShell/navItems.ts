import type { ReactElement } from "react";

interface NavEntry {
    icon: ReactElement;
    label: string;
    href: string;
    current: boolean;
    title?: string;
}

export type NavItem3 = NavEntry & { items?: never };

export type NavItem2 = NavEntry & { items?: readonly NavItem3[] };

export type NavItem1 = NavEntry & { items?: readonly NavItem2[] };

type AnyItem = NavEntry & { items?: readonly AnyItem[] };

export function holdsCurrent(item: AnyItem): boolean {
    return (item.items ?? []).some((child) => child.current || holdsCurrent(child));
}

export function activePath(item: NavItem1): (NavItem2 | NavItem3)[] {
    const second = item.items?.find((child) => child.current || holdsCurrent(child));
    if (second === undefined) return [];
    const third = second.items?.find((child) => child.current);
    return third === undefined ? [second] : [second, third];
}
