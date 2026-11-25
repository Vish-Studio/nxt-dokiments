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

/** Tabs follow the app's sidebar order, with CVs after My Documents. */
export const Default: Story = {
  play: async ({ canvas }) => {
    const titles = canvas
      .getAllByRole("button")
      .filter((button) => button.hasAttribute("aria-expanded"))
      .map((button) => button.textContent?.replace(/^\d+/, "").trim());
    await expect(titles).toEqual([
      "Start from a calm dashboard.",
      "Keep every document in order.",
      "Write a CV that looks the part.",
      "Keep the ones you reuse.",
      "Prefill your clients in one click.",
      "Find the right template fast.",
    ]);
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
