import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Input } from "../input";

const meta = {
  component: Input,
  tags: ["ai-generated"],
  args: {
    label: "Email",
    placeholder: "you@company.com",
    type: "email",
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    error: "Email is required.",
    id: "email",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Email is required.")).toBeVisible();
  },
};
