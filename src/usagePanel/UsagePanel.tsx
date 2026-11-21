import { Alert } from "../alert/Alert.js";
import { Anchor } from "../anchor/Anchor.js";
import { Paper } from "../paper/Paper.js";
import { Spinner } from "../spinner/Spinner.js";

export interface UsageLink {
    href: string;
    label: string;
    detail?: string;
}

export interface Usage<T> {
    usedBy: readonly T[];
    uses: readonly T[];
}

export interface UsageLabels {
    usedBy: string;
    uses: string;
    nothingUses: string;
    usesNothing: string;
    loading: string;
}

const ENGLISH: UsageLabels = {
    usedBy: "Used by",
    uses: "Uses",
    nothingUses: "Nothing uses this.",
    usesNothing: "This uses nothing.",
    loading: "Loading what uses this…",
};

function Card({ title, links, empty }: { title: string; links: UsageLink[]; empty: string }) {
    return (
        <Paper title={title} className="min-w-0 flex-1 basis-64 gap-1 text-sm wrap-anywhere">
            {links.length === 0 ? (
                <p className="text-muted-foreground">{empty}</p>
            ) : (
                <ul className="flex flex-col gap-1">
                    {links.map((link, index) => (
                        <li key={`${String(index)}:${link.href}`} className="flex flex-wrap items-baseline gap-x-1">
                            <Anchor href={link.href}>{link.label}</Anchor>
                            {link.detail !== undefined && <span className="text-muted-foreground">{link.detail}</span>}
                        </li>
                    ))}
                </ul>
            )}
        </Paper>
    );
}

export function UsagePanel<T>({
    usage,
    failure,
    linkOf,
    showUses = true,
    labels,
}: {
    usage: Usage<T> | null;
    failure: string | null;
    linkOf: (entry: T) => UsageLink;
    showUses?: boolean;
    labels?: Partial<UsageLabels>;
}) {
    const said = { ...ENGLISH, ...labels };
    if (failure !== null) return <Alert variant="destructive">{failure}</Alert>;
    if (usage === null) return <Spinner label={said.loading} size="sm" className="text-sm" />;
    return (
        <div className="flex flex-wrap gap-3">
            <Card title={said.usedBy} links={usage.usedBy.map(linkOf)} empty={said.nothingUses} />
            {showUses && <Card title={said.uses} links={usage.uses.map(linkOf)} empty={said.usesNothing} />}
        </div>
    );
}
