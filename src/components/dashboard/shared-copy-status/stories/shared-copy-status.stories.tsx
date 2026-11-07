import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { SharedDocument } from "@/types/sharing";

import { SharedCopyStatus } from "../shared-copy-status";

const pending: SharedDocument = {
  createdAt: 1,
  id: "owner-1_doc-1",
  locked: false,
  name: "Website redesign NDA",
  ownerEmail: "alex@example.com",
  ownerId: "owner-1",
  ownerName: "Alex Morgan",
  recipients: [{ email: "sam@example.com", invitedAt: 1, status: "pending" }],
  signatures: {},
  sourceDocumentId: "doc-1",
  templateId: "nda",
  updatedAt: 1,
  values: {},
};

const signed: SharedDocument = {
  ...pending,
  locked: true,
  signatures: {
    "recipient-1": {
      email: "sam@example.com",
      signedAt: new Date("2026-10-21T14:05:00Z").getTime(),
      type: "typed",
      value: "Sam Rivera",
    },
  },
};

const NOW = new Date("2026-10-21T15:00:00Z").getTime();

const revoked: SharedDocument = {
  ...pending,
  recipients: [
    {
      email: "sam@example.com",
      invitedAt: 1,
      revokedAt: NOW - 60_000,
      status: "revoked",
    },
  ],
};

const meta = {
  title: "Dashboard/Shared Copy Status",
  component: SharedCopyStatus,
  tags: ["ai-generated"],
  args: {
    document: pending,
    label: "Recipient signature",
    now: NOW,
    onResend: fn(),
    onRevoke: fn(),
    onView: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SharedCopyStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Not signed yet: says who it is waiting on and opens the shared copy. */
export const Waiting: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Waiting for sam@example.com to sign"),
    ).toBeVisible();
    await expect(canvas.getByText("Pending")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "View shared copy" }),
    );
    await expect(args.onView).toHaveBeenCalledOnce();
  },
};

/** Signed: says who signed and when. */
export const Signed: Story = {
  args: { document: signed },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(
        "Signed by sam@example.com on 21 Oct 2026",
      ),
    ).toBeVisible();
  },
};

/** Resend emails the recipient again. */
export const Resend: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Resend email" }),
    );
    await expect(args.onResend).toHaveBeenCalledOnce();
  },
};

/** Inside the cooldown the button is disabled and says how long to wait. */
export const ResendCooldown: Story = {
  args: {
    document: {
      ...pending,
      recipients: [
        {
          email: "sam@example.com",
          emailedAt: [NOW - 3 * 60_000],
          invitedAt: 1,
          status: "pending",
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: "Resend email" }),
    ).toBeDisabled();
    await expect(canvas.getByText("You can resend in 7 min.")).toBeVisible();
  },
};

/** Revoking asks for confirmation before it calls back. */
export const Revoke: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Revoke access" }),
    );
    await expect(args.onRevoke).not.toHaveBeenCalled();
    const dialog = within(await within(document.body).findByRole("dialog"));
    await userEvent.click(
      dialog.getByRole("button", { name: "Revoke access" }),
    );
    await expect(args.onRevoke).toHaveBeenCalledOnce();
  },
};

/** Revoked: no actions apart from viewing the copy, and a hint to share again. */
export const Revoked: Story = {
  args: { document: revoked },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(
        "Access revoked for sam@example.com. Share again to invite someone.",
      ),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Resend email" }),
    ).toBeNull();
    await expect(
      canvas.queryByRole("button", { name: "Revoke access" }),
    ).toBeNull();
  },
};

/** View-only share, not opened yet: waits on a view rather than a signature. */
export const ViewOnlyWaiting: Story = {
  args: { label: "Sharing", signable: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Waiting for sam@example.com to view"),
    ).toBeVisible();
    await expect(canvas.getByText("Not opened")).toBeVisible();
  },
};

/** View-only share once opened: says who viewed it and when. */
export const ViewOnlyViewed: Story = {
  args: {
    document: {
      ...pending,
      views: {
        "recipient-1": {
          email: "sam@example.com",
          viewedAt: new Date("2026-10-21T14:05:00Z").getTime(),
        },
      },
    },
    label: "Sharing",
    signable: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Viewed by sam@example.com on 21 Oct 2026"),
    ).toBeVisible();
    await expect(canvas.getByText("Viewed")).toBeVisible();
  },
};
