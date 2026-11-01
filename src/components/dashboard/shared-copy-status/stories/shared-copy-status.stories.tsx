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

const meta = {
  title: "Dashboard/Shared Copy Status",
  component: SharedCopyStatus,
  tags: ["ai-generated"],
  args: { document: pending, label: "Recipient signature", onView: fn() },
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
