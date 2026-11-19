export const HEADER_HEIGHT = 60;
export const PANEL_WIDTH = 220;
export const COLLAPSED_PANEL_WIDTH = 48;

export function panelSideClasses(side: "left" | "right"): { row: string; border: string } {
    return side === "left" ? { row: "flex-row", border: "border-r" } : { row: "flex-row-reverse", border: "border-l" };
}
