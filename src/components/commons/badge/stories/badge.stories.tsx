import { LockIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Badge } from "../badge";

const meta = {
  title: "Commons/Badge",
  component: Badge,
  tags: ["ai-generated"],
  args: {
    children: "Free",
    variant: "free",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TierFree: Story = {};

export const TierSilver: Story = {
  args: {
    children: "Silver",
    variant: "silver",
  },
};

export const TierGoldLocked: Story = {
  args: {
    children: "Gold",
    icon: <LockIcon aria-hidden size={12} weight="bold" />,
    variant: "gold",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Gold")).toBeVisible();
  },
};

export const Neutral: Story = {
  args: {
    children: "Modern style",
    variant: "neutral",
  },
};
