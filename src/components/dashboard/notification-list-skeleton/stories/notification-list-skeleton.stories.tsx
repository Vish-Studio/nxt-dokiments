import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { NotificationListSkeleton } from "../notification-list-skeleton";

const meta = {
  title: "Dashboard/Notification List Skeleton",
  component: NotificationListSkeleton,
  decorators: [
    (Story) => (
      <div className="w-96 rounded-box border border-steel-mist bg-base-100">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotificationListSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The shimmer is hidden from assistive tech; the status message is not. */
export const Loading: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("status", {
        name: /loading notifications/i,
      }),
    ).toBeInTheDocument();
  },
};
