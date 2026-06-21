import { FileTextIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { MobilePageHeader } from "../mobile-page-header";

const meta = {
  title: "Dashboard/Mobile Page Header",
  component: MobilePageHeader,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
  args: {
    description: "Create and manage documents from your saved templates.",
    icon: FileTextIcon,
    onOpenNavigation: fn(),
    title: "Documents",
    tone: "blue",
    visualVariant: "documents",
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
    const navigationButton = canvas.getByRole("button", { name: /open navigation/i });
    await expect(navigationButton).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Documents" })).toBeVisible();
    await userEvent.click(navigationButton);
    await expect(meta.args.onOpenNavigation).toHaveBeenCalledOnce();
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
