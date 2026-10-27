import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";

import type { SharedDocument } from "@/types/sharing";

import { SharedDocumentList } from "../shared-document-list";

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
  title: "Dashboard/Shared Document List",
  component: SharedDocumentList,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-app-panel p-5 sm:p-8">
        <Story />
      </div>
    ),
  ],
  args: {
    documents: sharedDocuments,
    onOpen: fn(),
    userEmail: "Sam@Example.com",
  },
} satisfies Meta<typeof SharedDocumentList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The user's own status is read from each share, matching their address case-insensitively. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Pending")).toBeVisible();
    await expect(canvas.getByText("Signed")).toBeVisible();
  },
};

/** Nothing shared yet — explains where shares come from. */
export const Empty: Story = {
  args: { documents: [] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("Nothing shared with you yet"),
    ).toBeVisible();
  },
};
