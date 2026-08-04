import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Faq } from "../faq";

const meta = {
  title: "Website/FAQ",
  component: Faq,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Faq>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: /questions people ask/i })).toBeVisible();
    await expect(canvas.getByText(/free accounts can browse templates/i)).toBeVisible();
  },
};
