import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { NotificationGroup } from "../notification-group";

const now = new Date("2026-11-24T12:00:00").getTime();

const meta = {
  title: "Dashboard/Notification Group",
  component: NotificationGroup,
  decorators: [
    (Story) => (
      <div className="w-96 rounded-box border border-steel-mist bg-base-100">
        <Story />
      </div>
    ),
  ],
  args: {
    group: {
      label: "New",
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
      ],
    },
    now,
  },
} satisfies Meta<typeof NotificationGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The section is named with its count; the heading itself is decorative. */
export const New: Story = {
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole("region", {
      name: "New, 2 notifications",
    });
    await expect(within(section).getAllByRole("listitem")).toHaveLength(2);
  },
};

export const Earlier: Story = {
  args: {
    group: {
      label: "Earlier",
      notifications: [
        {
          createdAt: now - 3 * 24 * 60 * 60_000,
          id: "template:classic-nda",
          kind: "template",
          read: true,
          title: "New template: NDA",
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("region", {
        name: "Earlier, 1 notification",
      }),
    ).toBeVisible();
  },
};
