import { knip } from "@maniumek/suwgate/knip";

export default knip({
    entry: [
        "src/index.ts",
        "src/diagram/index.ts",
        "src/query/index.ts",
        "scripts/.internal/palette.ts",
        "gate/consumer/app/src/main.tsx",
        "gate/consumer/app/vite.config.ts",
    ],
    project: ["src/**/*.{ts,tsx}", "gate/**/*.ts", "visual/**/*.ts", "scripts/.internal/*.ts"],
    ignoreDependencies: ["tailwindcss", "@fontsource-variable/inter"],
});
