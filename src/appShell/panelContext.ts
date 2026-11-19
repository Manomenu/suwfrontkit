import { createContext } from "react";

export const PanelContext = createContext<{ collapsed: boolean; side: "left" | "right" }>({ collapsed: false, side: "left" });
