import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { ClientListSkeleton } from "../client-list-skeleton";

const meta = {
  title: "Dashboard/Client List Skeleton",
  component: ClientListSkeleton,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClientListSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole("status", { name: "Loading your clients…" }),
    ).toBeInTheDocument();
    await expect(
      canvasElement.querySelectorAll(".skeleton").length,
    ).toBeGreaterThan(0);
  },
};
