import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LinkProvider } from "../leaveGuard/LinkProvider.js";
import { UsagePanel, type Usage, type UsageLink } from "./UsagePanel.js";

interface Reference {
    kind: string;
    id: string;
    field?: string;
}

const usage: Usage<Reference> = {
    usedBy: [
        { kind: "article", id: "pricing", field: "content" },
        { kind: "procedure", id: "intake" },
    ],
    uses: [{ kind: "fact", id: "opening-hours", field: "llmGuide" }],
};

function linkOf(reference: Reference): UsageLink {
    return {
        href: `/${reference.kind}s/${reference.id}/edit`,
        label: reference.id,
        detail: reference.field === undefined ? reference.kind : `${reference.kind} · ${reference.field}`,
    };
}

function card(name: string) {
    return within(screen.getByRole("region", { name }));
}

function entries(name: string): (string | null)[][] {
    return card(name)
        .getAllByRole("listitem")
        .map((item) => Array.from(item.children, (part) => part.textContent));
}

describe("UsagePanel", () => {
    it("lists every entry of Used by and of Uses as a link with its detail, each in its own card", () => {
        render(<UsagePanel usage={usage} failure={null} linkOf={linkOf} />);

        expect(card("Used by").getByRole("link", { name: "pricing" }).getAttribute("href")).toBe("/articles/pricing/edit");
        expect(card("Used by").getByRole("link", { name: "intake" }).getAttribute("href")).toBe("/procedures/intake/edit");
        expect(entries("Used by")).toEqual([
            ["pricing", "article · content"],
            ["intake", "procedure"],
        ]);
        expect(entries("Uses")).toEqual([["opening-hours", "fact · llmGuide"]]);
    });

    it("shows an entry without a detail as its link alone", () => {
        render(
            <UsagePanel
                usage={{ usedBy: [{ kind: "article", id: "pricing" }], uses: [] }}
                failure={null}
                linkOf={(entry) => ({ href: `/a/${entry.id}`, label: entry.id })}
            />,
        );

        expect(entries("Used by")).toEqual([["pricing"]]);
    });

    it("says so when nothing uses the resource and when it uses nothing", () => {
        render(<UsagePanel usage={{ usedBy: [], uses: [] }} failure={null} linkOf={linkOf} />);

        expect(card("Used by").getByText("Nothing uses this.")).toBeDefined();
        expect(card("Uses").getByText("This uses nothing.")).toBeDefined();
        expect(screen.queryAllByRole("link")).toEqual([]);
    });

    it("without showUses has only the Used by card, for a kind that can refer to nothing", () => {
        render(<UsagePanel usage={usage} failure={null} linkOf={linkOf} showUses={false} />);

        expect(screen.getAllByRole("region").map((region) => region.getAttribute("aria-label"))).toEqual(["Used by"]);
        expect(screen.queryByText("This uses nothing.")).toBeNull();
    });

    it("is a spinner while the usage loads and the failure's sentence when it failed, which wins over loading", () => {
        const { rerender } = render(<UsagePanel usage={null} failure={null} linkOf={linkOf} />);
        expect(screen.getByRole("status", { name: "Loading what uses this…" })).toBeDefined();
        expect(screen.queryByRole("region")).toBeNull();

        rerender(<UsagePanel usage={null} failure="The server is away." linkOf={linkOf} />);
        expect(screen.getByRole("alert").textContent).toBe("The server is away.");
        expect(screen.queryByRole("status")).toBeNull();
    });

    it("takes the app's texts in place of the English ones", () => {
        render(
            <UsagePanel
                usage={{ usedBy: [], uses: [] }}
                failure={null}
                linkOf={linkOf}
                labels={{ usedBy: "Używane przez", uses: "Używa", nothingUses: "Nic tego nie używa.", usesNothing: "Niczego nie używa." }}
            />,
        );

        expect(card("Używane przez").getByText("Nic tego nie używa.")).toBeDefined();
        expect(card("Używa").getByText("Niczego nie używa.")).toBeDefined();
    });

    it("takes the app's text for loading", () => {
        render(<UsagePanel usage={null} failure={null} linkOf={linkOf} labels={{ loading: "Ładowanie użyć…" }} />);

        expect(screen.getByRole("status", { name: "Ładowanie użyć…" })).toBeDefined();
    });

    it("moves with the app's router under a LinkProvider", () => {
        const navigate = vi.fn();
        render(
            <LinkProvider navigate={navigate}>
                <UsagePanel usage={usage} failure={null} linkOf={linkOf} />
            </LinkProvider>,
        );

        expect(fireEvent.click(screen.getByRole("link", { name: "intake" }))).toBe(false);
        expect(navigate).toHaveBeenCalledWith("/procedures/intake/edit");
    });
});
