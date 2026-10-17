import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { AuthFooter } from "../auth-footer";

const meta = {
  title: "Commons/Auth Footer",
  component: AuthFooter,
  tags: ["ai-generated"],
  parameters: { nextjs: { appDirectory: true } },
} satisfies Meta<typeof AuthFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "vish.studio" })).toHaveAttribute(
      "href",
      "https://www.vish.studio",
    );
    await expect(canvas.getByRole("link", { name: "Privacy Policy" })).toBeVisible();
  },
};
