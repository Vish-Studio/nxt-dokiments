import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BellIcon } from "@phosphor-icons/react";
import { expect } from "storybook/test";

import { ButtonIcon } from "../button-icon";

const meta = {
  title: "Commons/Button Icon",
  component: ButtonIcon,
  tags: ["ai-generated"],
  args: {
    "aria-label": "Notifications",
    icon: <BellIcon aria-hidden size={18} weight="bold" />,
  },
} satisfies Meta<typeof ButtonIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

export const Square: Story = {
  args: {
    variant: "outline",
    shape: "square",
  },
};

export const FlatNoShadow: Story = {
  args: {
    variant: "primary",
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: /notifications/i });
    const boxShadow = getComputedStyle(button).boxShadow;
    // Flat theme (--depth: 0): DaisyUI emits only fully transparent shadow
    // layers, so there is no visible shadow.
    const isFlat = boxShadow === "none" || /\/\s*0\)/.test(boxShadow);
    await expect(isFlat).toBe(true);
  },
};
