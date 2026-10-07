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
    // Cards, like the loaded list: one placeholder card per count, no table header.
    await expect(
      canvasElement.querySelectorAll("[aria-hidden] > .rounded-box"),
    ).toHaveLength(6);
    await expect(canvas.queryByText("Company")).not.toBeInTheDocument();
  },
};

export const SingleCard: Story = {
  args: { count: 1 },
};

/** Narrow viewport: the grid collapses to one column, as the loaded list does. */
export const Mobile: Story = {
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
};
