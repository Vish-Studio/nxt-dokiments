import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { SignInForm } from "../sign-in-form";

const meta = {
  component: SignInForm,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof SignInForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: async () => undefined,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /sign in/i })).toBeVisible();
  },
};

export const Validation: Story = {
  args: {
    onSubmit: async () => undefined,
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));
    await expect(await canvas.findByText("Email is required.")).toBeVisible();
    await expect(await canvas.findByText("Password is required.")).toBeVisible();
  },
};
