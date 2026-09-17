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
    onOpenNavigation: fn(),
    title: "My Documents",
    tone: "blue",
  },
} satisfies Meta<typeof MobilePageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-app-panel p-5">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigationButton = canvas.getByRole("button", {
      name: /open navigation/i,
    });
    await expect(navigationButton).toBeVisible();
    const title = canvas.getByRole("heading", { name: "My Documents" });
    await expect(title).toBeVisible();
    await expect(title).toHaveClass("text-xl");
    await userEvent.click(navigationButton);
    await expect(meta.args.onOpenNavigation).toHaveBeenCalledOnce();
  },
};

export const Dashboard: Story = {
  args: {
    showSettingsLink: true,
    title: "Dashboard",
    tone: "noir",
  },
  decorators: Default.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("link", { name: "Open settings" }),
    ).toHaveAttribute("href", "/settings");
  },
};
