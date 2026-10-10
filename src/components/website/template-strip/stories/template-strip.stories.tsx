import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { TemplateStrip } from "../template-strip";

const meta = {
  title: "Website/Template Strip",
  component: TemplateStrip,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TemplateStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: /templates, and counting/i }),
    ).toBeVisible();
    await expect(
      canvas.getAllByText("Standard Invoice").length,
    ).toBeGreaterThan(0);
  },
};
