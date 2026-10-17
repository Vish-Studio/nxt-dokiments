import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";

import { FeatureTabs } from "../feature-tabs";

const meta = {
  title: "Website/Feature Tabs",
  component: FeatureTabs,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof FeatureTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: /whole document workspace/i }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /start from a calm dashboard/i }),
    ).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(
      canvas.getByRole("button", { name: /find the right template/i }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole("link", { name: /browse the marketplace/i }),
      ).toBeVisible();
    });
  },
};
