import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { MobileNav } from "../mobile-nav";

const meta = {
  title: "Website/Mobile Nav",
  component: MobileNav,
  tags: ["ai-generated"],
  args: {
    forceVisible: true,
    isOpen: true,
    items: [
      { href: "#overview", label: "Overview" },
      { href: "#marketplace", label: "Marketplace" },
      { href: "#workflow", label: "Workflow" },
      { href: "#pricing", label: "Pricing" },
    ],
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof MobileNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: /dokiments home/i })).toBeVisible();
    await expect(canvas.getByRole("link", { name: /pricing/i })).toBeVisible();
  },
};

export const Authenticated: Story = {
  args: {
    isAuthenticated: true,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: "Go to my dashboard" }),
    ).toHaveAttribute("href", "/dashboard");
  },
};
