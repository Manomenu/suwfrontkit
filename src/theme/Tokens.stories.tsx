import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = { title: "Theme/Tokens" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const pairs = [
    ["background", "foreground"],
    ["card", "card-foreground"],
    ["primary", "primary-foreground"],
    ["primary-light", "primary-light-foreground"],
    ["secondary", "secondary-foreground"],
    ["muted", "muted-foreground"],
    ["accent", "accent-foreground"],
    ["destructive", "destructive-foreground"],
    ["destructive-light", "destructive-light-foreground"],
    ["success-light", "success"],
    ["warning-light", "warning"],
    ["info-light", "info"],
] as const;

export const Colors: Story = {
    render: () => (
        <div className="grid grid-cols-4 gap-3">
            {pairs.map(([background, foreground]) => (
                <div
                    key={background}
                    className="flex h-20 flex-col justify-end rounded-md border border-border p-3 text-sm"
                    style={{ background: `var(--${background})`, color: `var(--${foreground})` }}
                >
                    <span className="font-semibold">{background}</span>
                    <span>{foreground}</span>
                </div>
            ))}
        </div>
    ),
};

export const Typography: Story = {
    render: () => (
        <div className="flex flex-col gap-3">
            <h1 className="text-[26px] leading-[1.35] font-bold">Inter Variable, the page title</h1>
            <h2 className="text-base font-semibold">A panel heading</h2>
            <p>Body text at 16 pixels with a line height of 1.55, for paragraphs and table cells.</p>
            <p className="text-sm text-muted-foreground">Muted text for hints and captions.</p>
            <p className="font-light">Weight 300</p>
            <p className="font-medium">Weight 500</p>
            <p className="font-black">Weight 900</p>
            <code className="font-mono text-sm">const monospace = "system";</code>
        </div>
    ),
};
