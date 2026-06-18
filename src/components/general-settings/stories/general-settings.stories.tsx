import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { GeneralSettings } from "../general-settings";

const meta = {
  component: GeneralSettings,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GeneralSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /general/i })).toBeVisible();
    const goldenButton = canvas.getByText("Golden").closest("button");
    await expect(goldenButton).not.toBeNull();
    await userEvent.click(goldenButton as HTMLButtonElement);
    await expect(goldenButton).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};
