import { FileTextIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { MobilePageHeader } from "../mobile-page-header";

const meta = {
  title: "Dashboard/Mobile Page Header",
  component: MobilePageHeader,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  args: {
    description: "Create and manage documents from your saved templates.",
    icon: FileTextIcon,
    onOpenNavigation: () => {},
    title: "Documents",
    tone: "blue",
  },
} satisfies Meta<typeof MobilePageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-app-panel p-5">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /open navigation/i })).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Documents" })).toBeVisible();
  },
};

export const Compact: Story = {
  args: { isCompact: true },
  decorators: Expanded.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Documents" })).toBeVisible();
  },
};
