import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StorefrontIcon } from "@phosphor-icons/react";
import { expect, within } from "storybook/test";

import { PageBanner } from "../page-banner";

const meta = {
  component: PageBanner,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    description: "Ready-to-use business documents in three styles.",
    icon: StorefrontIcon,
    title: "Marketplace",
    tone: "golden",
  },
} satisfies Meta<typeof PageBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Golden: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Marketplace" })).toBeVisible();
  },
};

export const Noir: Story = {
  args: { title: "Settings", tone: "noir" },
};

export const Pink: Story = {
  args: { title: "My Templates", tone: "pink" },
};

export const Teal: Story = {
  args: { title: "Settings", tone: "teal" },
};

export const Purple: Story = {
  args: { title: "Subscription", tone: "purple" },
};

export const Blue: Story = {
  args: { title: "Documents", tone: "blue" },
};

export const Mist: Story = {
  args: { title: "Archive", tone: "mist" },
};

export const Soft: Story = {
  args: { title: "Subscription", tone: "purple", variant: "soft" },
};

export const Outline: Story = {
  args: { title: "Documents", tone: "blue", variant: "outline" },
};
