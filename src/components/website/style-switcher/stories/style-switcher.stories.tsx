import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { StyleSwitcher } from "../style-switcher";

const meta = {
  title: "Website/Style Switcher",
  component: StyleSwitcher,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof StyleSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: /one document\. every style/i }),
    ).toBeVisible();

    const classic = canvas.getByRole("button", { name: /classic/i });
    await expect(classic).toHaveAttribute("aria-pressed", "true");

    const brutalist = canvas.getByRole("button", { name: /brutalist/i });
    await userEvent.click(brutalist);
    await expect(brutalist).toHaveAttribute("aria-pressed", "true");
    await expect(classic).toHaveAttribute("aria-pressed", "false");
  },
};
