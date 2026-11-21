import { use } from "react";

import { NavLevelContext, type NavLevel } from "./navLevel.js";
import { NavLink } from "./NavLink.js";
import { activePath, holdsCurrent, type NavItem1, type NavItem2, type NavItem3 } from "./navItems.js";
import { PanelContext } from "./panelContext.js";

const GUIDE = "ml-3 flex flex-col gap-0.5 border-l border-border";

function Entry({ item, level }: { item: NavItem1 | NavItem2 | NavItem3; level: NavLevel }) {
    return (
        <NavLevelContext value={{ level, holdsCurrent: holdsCurrent(item) }}>
            <NavLink
                href={item.href}
                icon={item.icon}
                label={item.label}
                current={item.current}
                {...(item.title === undefined ? {} : { title: item.title })}
            />
        </NavLevelContext>
    );
}

function Expanded({ items }: { items: readonly NavItem1[] }) {
    return (
        <ul className="flex flex-col gap-0.5">
            {items.map((first) => (
                <li key={first.href} className="flex flex-col gap-0.5">
                    <Entry item={first} level={1} />
                    {first.items !== undefined && first.items.length > 0 && (
                        <ul className={GUIDE}>
                            {first.items.map((second) => (
                                <li key={second.href} className="flex flex-col gap-0.5">
                                    <Entry item={second} level={2} />
                                    {second.items !== undefined && second.items.length > 0 && (
                                        <ul className={GUIDE}>
                                            {second.items.map((third) => (
                                                <li key={third.href}>
                                                    <Entry item={third} level={3} />
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            ))}
        </ul>
    );
}

function Collapsed({ items }: { items: readonly NavItem1[] }) {
    return (
        <ul className="flex flex-col gap-0.5">
            {items.map((first) => {
                const path = activePath(first);
                if (path.length === 0) {
                    return (
                        <li key={first.href}>
                            <Entry item={first} level={1} />
                        </li>
                    );
                }
                return (
                    <li key={first.href} data-slot="nav-rail" className="flex w-9 flex-col gap-0.5 rounded-md bg-accent/40 pb-0.5">
                        <Entry item={first} level={1} />
                        {path.map((item, index) => (
                            <Entry key={item.href} item={item} level={index === 0 ? 2 : 3} />
                        ))}
                    </li>
                );
            })}
        </ul>
    );
}

export function NavTree({ items }: { items: readonly NavItem1[] }) {
    const { collapsed } = use(PanelContext);
    return collapsed ? <Collapsed items={items} /> : <Expanded items={items} />;
}
