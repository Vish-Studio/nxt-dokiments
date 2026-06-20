import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Button } from "../button";

const meta = {
  title: "Commons/Button",
  component: Button,
  tags: ["ai-generated"],
  args: {
    children: "Create document",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Save draft",
  },
};

export const Accent: Story = {
  args: {
    variant: "accent",
    children: "Save template",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Cancel",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Preview",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Delete document",
  },
};

export const WithoutIcon: Story = {
  args: {
    icon: null,
    children: "Continue",
  },
};

export const CssCheck: Story = {
  args: {
    children: "Submit",
    icon: null,
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: /submit/i });
    await expect(getComputedStyle(button).backgroundColor).toBe("rgb(32, 13, 45)");
  },
};
