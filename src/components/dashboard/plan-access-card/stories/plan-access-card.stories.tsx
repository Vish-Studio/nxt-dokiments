import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { tierLocksDisabled } from "@/lib/market-place";

import { PlanAccessCard } from "../plan-access-card";

const meta = {
  title: "Dashboard/Plan Access Card",
  component: PlanAccessCard,
  parameters: { layout: "padded", nextjs: { appDirectory: true } },
  args: { role: "free" },
} satisfies Meta<typeof PlanAccessCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Free: Story = {
  play: async ({ canvas }) => {
    if (tierLocksDisabled) {
      await expect(
        canvas.getByText("8 of 8 features unlocked on your plan."),
      ).toBeVisible();
    } else {
      await expect(
        canvas.getAllByText(/^(Silver|Gold) plan$/).length,
      ).toBeGreaterThan(0);
    }
    await expect(
      canvas.getByRole("link", { name: /upgrade plan/i }),
    ).toHaveAttribute("href", "/subscription");
  },
};

export const Silver: Story = {
  args: { role: "silver" },
};

/** Everything unlocked, and no upgrade offered. */
export const Superadmin: Story = {
  args: { role: "superadmin" },
  play: async ({ canvas }) => {
    await expect(canvas.queryAllByText(/^(Silver|Gold) plan$/)).toHaveLength(0);
    await expect(
      canvas.getByText("Every feature is unlocked on your account."),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("link", { name: /upgrade plan/i }),
    ).not.toBeInTheDocument();
  },
};
