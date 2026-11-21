import { createContext } from "react";

export type NavLevel = 1 | 2 | 3;

export const NavLevelContext = createContext<{ level: NavLevel; holdsCurrent: boolean }>({ level: 1, holdsCurrent: false });
