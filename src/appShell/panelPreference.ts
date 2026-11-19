export function storedCollapsed(key: string): boolean | null {
    try {
        const stored = window.localStorage.getItem(key);
        return stored === null ? null : stored === "collapsed";
    } catch {
        return null;
    }
}

export function storeCollapsed(key: string, collapsed: boolean): boolean {
    try {
        window.localStorage.setItem(key, collapsed ? "collapsed" : "expanded");
        return true;
    } catch {
        return false;
    }
}
