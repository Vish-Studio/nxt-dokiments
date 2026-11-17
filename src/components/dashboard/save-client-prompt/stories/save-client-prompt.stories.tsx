import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";

import { SaveClientPrompt } from "../save-client-prompt";

const meta = {
  title: "Dashboard/Save Client Prompt",
  component: SaveClientPrompt,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="max-w-xl bg-base-100 p-6">
        <Story />
      </div>
    ),
  ],
  args: { clientName: "Acme Co.", isSaved: false, onSave: fn() },
} satisfies Meta<typeof SaveClientPrompt>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NotSavedYet: Story = {
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save client" }));
    await expect(args.onSave).toHaveBeenCalled();
  },
};

export const AlreadySaved: Story = {
  args: { isSaved: true },
};
