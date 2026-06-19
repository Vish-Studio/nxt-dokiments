import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { ForgotPasswordForm } from "../forgot-password-form";

const meta = {
  component: ForgotPasswordForm,
  tags: ["ai-generated"],
  args: {
    onSubmit: async () => undefined,
  },
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof ForgotPasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /send reset link/i })).toBeVisible();
  },
};

export const Success: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText("Email"), "person@dokiments.test");
    await userEvent.click(canvas.getByRole("button", { name: /send reset link/i }));
    await expect(await canvas.findByText("Password reset email sent. Check your inbox.")).toBeVisible();
  },
};
