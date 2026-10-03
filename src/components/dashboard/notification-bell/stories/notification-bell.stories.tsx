import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { NotificationBellView } from "../notification-bell";

const now = Date.now();

const meta = {
  title: "Dashboard/Notification Bell",
  component: NotificationBellView,
  args: {
    notifications: [
      {
        action: { href: "/marketplace", label: "View in marketplace" },
        body: "Modern style · silver plan",
        createdAt: now - 5 * 60_000,
        id: "template:modern-invoice",
        kind: "template",
        read: false,
        title: "New template: Invoice",
      },
      {
        action: { label: "Update now", onClick: fn() },
        body: "A new version of Dokiments is ready.",
        createdAt: now - 60 * 60_000,
        id: "app-update",
        kind: "app-update",
        persistent: true,
        read: false,
        title: "Update available",
      },
      {
        createdAt: now - 3 * 24 * 60 * 60_000,
        id: "template:classic-nda",
        kind: "template",
        read: true,
        title: "New template: NDA",
      },
    ],
    onMarkAllAsRead: fn(),
    unreadCount: 2,
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-96 justify-end bg-golden-harvest p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NotificationBellView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visual: Story = {};

export const Empty: Story = {
  args: { notifications: [], unreadCount: 0 },
};

export const ShowsUnreadCountAndOpens: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bell = canvas.getByRole("button", {
      name: "Notifications, 2 unread",
    });

    await userEvent.click(bell);
    await waitFor(() => {
      expect(canvas.getByText("New template: Invoice")).toBeVisible();
      expect(canvas.getByText("Update available")).toBeVisible();
    });
  },
};

export const MarkAllAsRead: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Notifications, 2 unread" }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Mark all as read" }),
    );
    await expect(args.onMarkAllAsRead).toHaveBeenCalledTimes(1);
  },
};
