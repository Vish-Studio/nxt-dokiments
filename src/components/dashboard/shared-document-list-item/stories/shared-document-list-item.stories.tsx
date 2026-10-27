import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { SharedDocument } from "@/types/sharing";

import { SharedDocumentListItem } from "../shared-document-list-item";

const sharedDocuments: SharedDocument[] = [
  {
    createdAt: new Date("2026-10-20T09:30:00Z").getTime(),
    id: "owner-1_doc-1",
    locked: false,
    name: "Website redesign NDA",
    ownerEmail: "alex@example.com",
    ownerId: "owner-1",
    ownerName: "Alex Morgan",
    recipients: [
      {
        email: "sam@example.com",
        invitedAt: 1,
        status: "pending",
      },
    ],
    signatures: {},
    sourceDocumentId: "doc-1",
    templateId: "nda",
    updatedAt: 1,
    values: { title: "Website redesign NDA" },
  },
  {
    createdAt: new Date("2026-10-12T13:15:00Z").getTime(),
    id: "owner-2_doc-2",
    locked: true,
    name: "Studio services agreement",
    ownerEmail: "priya@example.com",
    ownerId: "owner-2",
    ownerName: "",
    recipients: [
      {
        email: "sam@example.com",
        invitedAt: 1,
        signedAt: 2,
        status: "signed",
      },
    ],
    signatures: {},
    sourceDocumentId: "doc-2",
    templateId: "contract",
    updatedAt: 2,
    values: {},
  },
];

const meta = {
  title: "Dashboard/Shared Document List Item",
  component: SharedDocumentListItem,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <ol className="overflow-hidden rounded-box border border-steel-mist bg-base-100">
        <Story />
      </ol>
    ),
  ],
  args: { document: sharedDocuments[0], onOpen: fn(), status: "pending" },
} satisfies Meta<typeof SharedDocumentListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sender name, status badge, and opening the row through its overlay button. */
export const Pending: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Alex Morgan")).toBeVisible();
    await expect(canvas.getByText("Pending")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Open Website redesign NDA" }),
    );
    await expect(args.onOpen).toHaveBeenCalledWith(args.document);
  },
};

/** No owner name — the sender's address stands in for it. */
export const Signed: Story = {
  args: { document: sharedDocuments[1], status: "signed" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("priya@example.com")).toBeVisible();
    await expect(canvas.getByText("Signed")).toBeVisible();
  },
};
