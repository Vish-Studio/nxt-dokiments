import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";

import { Input } from "../input";

const meta = {
  title: "Commons/Input",
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

export const Password: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
    type: "password",
  },
  play: async ({ canvas }) => {
    const field = canvas.getByPlaceholderText("Enter your password");
    await userEvent.type(field, "super-secret");
    await expect(field).toHaveAttribute("type", "password");

    const toggle = canvas.getByRole("button", { name: /show password/i });
    await userEvent.click(toggle);
    await expect(field).toHaveAttribute("type", "text");
    await expect(field).toHaveValue("super-secret");
    await expect(
      canvas.getByRole("button", { name: /hide password/i }),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: /hide password/i }),
    );
    await expect(field).toHaveAttribute("type", "password");
  },
};
