import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { ApiError } from "../apiClient/apiClient.js";
import { MistakeList } from "./MistakeList.js";

it("lists each mistake of a refusal with where it applies, what is wrong and what to do", () => {
    const refusal = new ApiError(422, {
        code: "definition.invalid",
        mistakes: [
            { code: "fact.name.invalid", message: "The name has a space.", fix: "Write it without spaces.", at: "facts.employer name" },
            { code: "persona.required", message: "The bot has no persona.", fix: "Choose a persona." },
        ],
    });
    render(<MistakeList mistakes={refusal.mistakes} />);

    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
        "facts.employer name: The name has a space. Write it without spaces.",
        "The bot has no persona. Choose a persona.",
    ]);
});

it("draws nothing when there is no mistake", () => {
    const { container } = render(<MistakeList mistakes={[]} />);

    expect(container.innerHTML).toBe("");
});
