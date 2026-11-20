import suwgate from "@maniumek/suwgate/prettier";

export default {
    ...suwgate,
    plugins: ["prettier-plugin-tailwindcss"],
    tailwindStylesheet: "./.storybook/storybook.css",
};
