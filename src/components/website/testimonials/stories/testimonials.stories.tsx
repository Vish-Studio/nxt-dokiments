import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Testimonials } from "../testimonials";

const meta = {
  title: "Website/Testimonials",
  component: Testimonials,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Testimonials>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: /grounded way/i })).toBeVisible();
    await expect(canvas.getByRole("region", { name: "Customer testimonials" })).toBeVisible();
    await expect(canvas.getAllByLabelText("5 out of 5 stars")).toHaveLength(7);
  },
};
