import "./index.css";

import { Diff, History } from "@maniumek/suwfrontstyle";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root");
if (!root) throw new Error("index.html has no #root element");

createRoot(root).render(
    <StrictMode>
        <History entries={[{ id: "1", at: "2026-11-19T14:05:00Z", who: "Anna", what: "edited the article Prices" }]} />
        <Diff before={"Prices\n"} after={"Price list\n"} />
    </StrictMode>,
);
