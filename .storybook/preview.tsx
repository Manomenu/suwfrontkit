import "./storybook.css";

import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
    parameters: {
        layout: "padded",
        a11y: { test: "error" },
        backgrounds: { disable: true },
    },
};

export default preview;
