import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { mockPhoneViewport } from "@/lib/storybook/mock-phone-viewport";

import { NotificationBellView } from "../notification-bell";

const now = new Date("2026-11-24T12:00:00").getTime();

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
        action: {
          href: "/my-documents?tab=shared",
          label: "View shared documents",
        },
        body: "Website redesign NDA",
        createdAt: now - 2 * 60 * 60_000,
        id: "document-shared:share-1",
        kind: "document-shared",
        read: false,
        title: "Alex Morgan shared a document",
      },
      {
        action: {
          href: "/my-documents/shared/share-2",
          label: "View shared copy",
        },
        body: "Website redesign NDA",
        createdAt: now - 90 * 60_000,
        id: "document-signed:share-2:user-2",
        kind: "document-signed",
        read: false,
        title: "priya@example.com signed a document",
      },
      {
        createdAt: now - 3 * 24 * 60 * 60_000,
        id: "template:classic-nda",
        kind: "template",
        read: true,
        title: "New template: NDA",
      },
    ],
    now,
    onMarkAllAsRead: fn(),
    unreadCount: 4,
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

/** Nothing yet: say so, and say what will show up here. */
export const Empty: Story = {
  args: { notifications: [], unreadCount: 0 },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(page.getByRole("button", { name: "Notifications" }));
    // The popover fades in, so wait for it rather than asserting at once.
    await waitFor(async () => {
      await expect(await page.findByText("You're all caught up")).toBeVisible();
    });
    await expect(
      page.getByRole("button", { name: "Mark all as read" }),
    ).toBeDisabled();
  },
};

/** First fetch in flight: skeleton rows, not a bare "Loading…". */
export const Loading: Story = {
  args: { isLoading: true, notifications: [], unreadCount: 0 },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(page.getByRole("button", { name: "Notifications" }));
    await expect(
      await page.findByRole("status", { name: /loading notifications/i }),
    ).toBeInTheDocument();
  },
};

/** Unread items are grouped under "New", read ones under "Earlier". */
export const GroupsNewAndEarlier: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Notifications, 4 unread" }),
    );
    const fresh = await canvas.findByRole("region", {
      name: "New, 4 notifications",
    });
    await expect(within(fresh).getAllByRole("listitem")).toHaveLength(4);
    await waitFor(() => {
      expect(
        canvas.getByRole("region", { name: "Earlier, 1 notification" }),
      ).toBeVisible();
      expect(canvas.getByText("4 new")).toBeVisible();
    });
  },
};

/** An action link closes the panel, so it never lingers over the next page. */
export const ActionClosesPanel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Notifications, 4 unread" }),
    );
    await userEvent.click(
      await canvas.findByRole("button", { name: "Update now" }),
    );
    await waitFor(() => {
      expect(canvas.queryByText("Update available")).toBeNull();
    });
  },
};

export const ShowsUnreadCountAndOpens: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bell = canvas.getByRole("button", {
      name: "Notifications, 4 unread",
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
      canvas.getByRole("button", { name: "Notifications, 4 unread" }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Mark all as read" }),
    );
    await expect(args.onMarkAllAsRead).toHaveBeenCalledTimes(1);
  },
};

/** On phones the list opens in a bottom sheet whose title leads with the bell. */
export const OnPhone: Story = {
  beforeEach: mockPhoneViewport,
  play: async ({ args, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      page.getByRole("button", { name: "Notifications, 4 unread" }),
    );
    const sheet = await page.findByRole("dialog", { name: "Notifications" });
    await expect(sheet).toHaveAttribute("data-layout", "sheet");
    await expect(
      within(sheet).getByRole("heading", { name: "Notifications" }).querySelector("svg"),
    ).not.toBeNull();
    await expect(
      within(sheet).getByText("New template: Invoice"),
    ).toBeVisible();

    await userEvent.click(
      within(sheet).getByRole("button", { name: "Mark all as read" }),
    );
    await expect(args.onMarkAllAsRead).toHaveBeenCalledTimes(1);
  },
};
