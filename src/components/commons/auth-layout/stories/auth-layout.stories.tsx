import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Button } from "@/components/commons/button/button";

import { AuthLayout } from "../auth-layout";

const meta = {
  title: "Commons/Auth Layout",
  component: AuthLayout,
  tags: ["ai-generated"],
  args: {
    children: <Button icon={null}>Continue</Button>,
    description: "Access your dashboard.",
    title: "Sign in",
  },
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { name: "Sign in" })).toBeVisible();
  },
};
