import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { AuthShowcase } from "../auth-showcase";

const meta = {
  title: "Commons/Auth Showcase",
  component: AuthShowcase,
  decorators: [
    (Story) => (
      <div className="h-screen max-w-3xl p-3">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AuthShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SelectStep: Story = {
  play: async ({ canvas }) => {
    const documentsStep = canvas.getByRole("tab", { name: "Documents" });
    await userEvent.click(documentsStep);
    await expect(documentsStep).toHaveAttribute("aria-selected", "true");
  },
};
