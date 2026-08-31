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
    // The promo field is optional, so an empty one must never block sign-up.
    await expect(canvas.queryByText(/promo code is required/i)).toBeNull();
  },
};

/** The launch offer is advertised alongside the credentials, with an optional field for it. */
export const WithPromoCallout: Story = {
  args: {
    onSubmit: async () => undefined,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Launch Promo")).toBeVisible();
    await expect(canvas.getByText("ViSHDOK2026!")).toBeVisible();
    await expect(canvas.getByLabelText(/promo code \(optional\)/i)).toBeVisible();
  },
};
