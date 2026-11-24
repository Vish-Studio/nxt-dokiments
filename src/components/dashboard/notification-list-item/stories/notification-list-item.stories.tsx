import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { NotificationListItem } from "../notification-list-item";

const now = new Date("2026-11-24T12:00:00").getTime();

const meta = {
  title: "Dashboard/Notification List Item",
  component: NotificationListItem,
  decorators: [
    (Story) => (
      <ul className="w-96 rounded-box border border-steel-mist bg-base-100 p-2">
        <Story />
      </ul>
    ),
  ],
  args: {
    notification: {
      action: { href: "/marketplace", label: "View in marketplace" },
      body: "Modern style · silver plan",
      createdAt: now - 5 * 60_000,
      id: "template:modern-invoice",
      kind: "template",
      read: false,
      title: "New template: Invoice",
    },
    now,
  },
} satisfies Meta<typeof NotificationListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Unread: grey surface, dot, and a screen-reader "(unread)". */
export const Unread: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("(unread)")).toBeInTheDocument();
    await expect(canvas.getByText("5m ago")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "View in marketplace" }),
    ).toHaveAttribute("href", "/marketplace");
  },
};

export const Read: Story = {
  args: {
    notification: {
      createdAt: now - 3 * 24 * 60 * 60_000,
      id: "template:classic-nda",
      kind: "template",
      read: true,
      title: "New template: NDA",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("(unread)")).toBeNull();
    await expect(canvas.getByText("3d ago")).toBeVisible();
    await expect(canvas.queryByRole("link")).toBeNull();
  },
};

/** One story per kind, to compare the tile colours side by side. */
export const Kinds: Story = {
  render: (args) => (
    <>
      {(
        [
          ["template", "New template: Invoice"],
          ["document-shared", "Alex Morgan shared a document"],
          ["document-signed", "priya@example.com signed a document"],
          ["app-update", "Update available"],
          ["something-new", "A kind we have not styled yet"],
        ] as const
      ).map(([kind, title]) => (
        <NotificationListItem
          key={kind}
          notification={{
            ...args.notification,
            body: "Website redesign NDA",
            id: kind,
            kind,
            title,
          }}
          now={now}
        />
      ))}
    </>
  ),
};

/** A persistent notification (an update waiting) gets a golden action button. */
export const PersistentButtonAction: Story = {
  args: {
    notification: {
      action: { label: "Update now", onClick: fn() },
      body: "A new version of Dokiments is ready.",
      createdAt: now - 60 * 60_000,
      id: "app-update",
      kind: "app-update",
      persistent: true,
      read: false,
      title: "Update available",
    },
  },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Update now" }),
    );
    await expect(args.notification.action?.onClick).toHaveBeenCalledOnce();
  },
};

/** Long text stays inside the panel: the title wraps and the body clamps. */
export const LongContent: Story = {
  args: {
    notification: {
      action: { href: "/my-documents", label: "View shared documents" },
      body: "A very long document name that goes on and on and on, well past what fits on two lines of a narrow notification panel, to prove it is clamped",
      createdAt: now - 2 * 60 * 60_000,
      id: "document-shared:long",
      kind: "document-shared",
      read: false,
      title:
        "Alexandropoulos-Whitfield Consulting Partners shared a document with you",
    },
  },
};
