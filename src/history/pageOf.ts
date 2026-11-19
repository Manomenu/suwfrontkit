export interface Shown<T> {
    entries: T[];
    page: number;
    pages: number;
    hasNext?: boolean;
}

export interface ServerPaging {
    total?: number | undefined;
    hasNext?: boolean | undefined;
}

export function pageOf<T>(entries: T[], page: number, pageSize: number, server: ServerPaging): Shown<T> {
    const size = Math.max(1, Math.floor(pageSize));
    if (server.hasNext !== undefined) return { entries, page, pages: page + (server.hasNext ? 1 : 0), hasNext: server.hasNext };
    if (server.total !== undefined) return { entries, page, pages: Math.max(1, Math.ceil(server.total / size)) };
    const pages = Math.max(1, Math.ceil(entries.length / size));
    const shown = Math.min(Math.max(1, page), pages);
    return { entries: entries.slice((shown - 1) * size, shown * size), page: shown, pages };
}

export function isAlone(shown: Shown<unknown>): boolean {
    return shown.page <= 1 && (shown.hasNext === undefined ? shown.pages <= 1 : !shown.hasNext);
}
