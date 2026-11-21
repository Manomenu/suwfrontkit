import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert } from "../alert/Alert.js";
import { MistakeList } from "./MistakeList.js";

const meta = {
    component: MistakeList,
    args: {
        mistakes: [
            { code: "fact.name.invalid", message: "The name has a space.", fix: "Write it without spaces.", at: "facts.employer name" },
            { code: "persona.required", message: "The bot has no persona.", fix: "Choose a persona." },
        ],
    },
} satisfies Meta<typeof MistakeList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Listed: Story = {};

export const InARefusal: Story = {
    render: (args) => (
        <Alert variant="destructive" className="flex flex-col gap-1">
            <span>The bot was not saved.</span>
            <MistakeList {...args} />
        </Alert>
    ),
};
