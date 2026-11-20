const MISSING = "—";

type Amount = number | null | undefined;

export function formatPercent(share: Amount): string {
    if (share === null || share === undefined || !Number.isFinite(share)) return MISSING;
    return new Intl.NumberFormat("en-GB", { style: "percent", maximumFractionDigits: 1 }).format(share);
}

export function formatSeconds(milliseconds: Amount): string {
    if (milliseconds === null || milliseconds === undefined || !Number.isFinite(milliseconds)) return MISSING;
    const seconds = Math.round(milliseconds / 100) / 10;
    return `${new Intl.NumberFormat("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(seconds)} s`;
}
