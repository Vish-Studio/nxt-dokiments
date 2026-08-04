import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { PlanCard } from "../plan-card";

const meta = {
  title: "Commons/Plan Card",
  component: PlanCard,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div className="w-72 bg-app-panel p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    action: { href: "/sign-up", label: "Sign up" },
    description: "For growing teams that reuse documents every week.",
    features: ["Full template marketplace", "Saved favorites", "Team sharing"],
    name: "Studio",
    period: "/mo",
    price: "$12",
  },
} satisfies Meta<typeof PlanCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: "default" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Studio" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: /sign up/i })).toBeVisible();
  },
};

export const Accent: Story = {
  args: { variant: "accent", badge: "Popular" },
};

export const Featured: Story = {
  args: { variant: "featured" },
};

export const CurrentPlan: Story = {
  args: {
    action: { disabled: true, label: "Current plan" },
    badge: "Current plan",
    variant: "accent",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /current plan/i })).toBeDisabled();
  },
};
