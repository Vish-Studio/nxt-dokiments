import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { UseCases } from "../use-cases";

const meta = {
  title: "Website/Use Cases",
  component: UseCases,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof UseCases>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: /clear paths/i })).toBeVisible();
  },
};
