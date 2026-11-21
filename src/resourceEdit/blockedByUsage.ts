export function blockedByUsage(usedBy: number): string | null {
    if (usedBy === 0) return null;
    return usedBy === 1
        ? "Used in 1 place. Remove that reference first."
        : `Used in ${String(usedBy)} places. Remove those references first.`;
}
