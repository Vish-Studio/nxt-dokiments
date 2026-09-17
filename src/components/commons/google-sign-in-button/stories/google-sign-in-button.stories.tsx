import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { GoogleSignInButton } from "../google-sign-in-button";

const meta = {
  title: "Commons/Google Sign In Button",
  component: GoogleSignInButton,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof GoogleSignInButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: /continue with google/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      "/api/auth/google/start?next=%2Fdashboard",
    );
  },
};

export const CustomLabel: Story = {
  args: {
    label: "Sign up with Google",
    next: "/settings",
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: /sign up with google/i });
    await expect(link).toHaveAttribute(
      "href",
      "/api/auth/google/start?next=%2Fsettings",
    );
  },
};

/**
 * A promo code typed on the auth form travels with the OAuth redirect, so choosing
 * Google doesn't silently discard it. Encoded, since the code contains `!`.
 */
export const WithPromoCode: Story = {
  args: {
    promoCode: "ViSHDOK2026!",
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: /continue with google/i }),
    ).toHaveAttribute(
      "href",
      "/api/auth/google/start?next=%2Fdashboard&promoCode=ViSHDOK2026!",
    );
  },
};

/** An untouched field must not add an empty param to the redirect. */
export const WithBlankPromoCode: Story = {
  args: {
    promoCode: "   ",
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: /continue with google/i }),
    ).toHaveAttribute("href", "/api/auth/google/start?next=%2Fdashboard");
  },
};
