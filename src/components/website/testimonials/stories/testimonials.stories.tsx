import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";

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
    await expect(
      canvas.getByRole("heading", { name: /grounded way/i }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("region", { name: "Customer testimonials" }),
    ).toBeVisible();
    await expect(canvas.getAllByRole("button")).toHaveLength(7);

    const omar = canvas.getByRole("button", { name: /omar williams/i });
    await userEvent.click(omar);
    await expect(omar).toHaveAttribute("aria-pressed", "true");
    await waitFor(async () => {
      await expect(
        canvas.getByText(/find the template, save it/i),
      ).toBeVisible();
    });
  },
};
