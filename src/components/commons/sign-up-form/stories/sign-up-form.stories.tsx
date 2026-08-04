import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { SignUpForm } from "../sign-up-form";

const meta = {
  title: "Commons/Sign Up Form",
  component: SignUpForm,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof SignUpForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: async () => undefined,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /create account/i })).toBeVisible();
  },
};

export const Validation: Story = {
  args: {
    onSubmit: async () => undefined,
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /create account/i }));
    await expect(await canvas.findByText("Full name is required.")).toBeVisible();
    await expect(await canvas.findByText("Email is required.")).toBeVisible();
    await expect(await canvas.findByText("Password is required.")).toBeVisible();
  },
};
