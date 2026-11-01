import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { SharedDocument } from "@/types/sharing";

import { SharedDocumentSheet } from "../shared-document-sheet";

const baseDocument: SharedDocument = {
  createdAt: new Date("2026-10-20T09:30:00Z").getTime(),
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
  templateSnapshot: {
    description: "",
    documentType: "nda",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "terms", label: "Terms", type: "textarea" },
      {
        key: "recipientSignature",
        label: "Recipient signature",
        type: "text",
      },
    ],
    name: "NDA",
    style: {
      description: "",
      id: "classic",
      name: "Classic",
      tier: "free",
    },
  },
  updatedAt: 1,
  values: {
    terms: "Both parties agree to keep the project details confidential.",
    title: "Website redesign NDA",
  },
};

const signedDocument: SharedDocument = {
  ...baseDocument,
  locked: true,
  recipients: [
    {
      email: "sam@example.com",
      invitedAt: 1,
      signedAt: 2,
      status: "signed",
    },
  ],
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
  title: "Dashboard/Shared Document Sheet",
  component: SharedDocumentSheet,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    document: baseDocument,
    onSign: fn(),
    viewer: "recipient",
  },
} satisfies Meta<typeof SharedDocumentSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Signing stays disabled until a name is typed, then asks for confirmation. */
export const RecipientSigns: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const signButton = canvas.getByRole("button", { name: "Sign document" });
    await expect(signButton).toBeDisabled();

    await userEvent.type(
      canvas.getByLabelText("Type your full name to sign"),
      "  Sam Rivera  ",
    );
    await userEvent.click(signButton);
    await expect(canvas.getByText("Sign this document?")).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "Sign and lock" }),
    );
    await expect(args.onSign).toHaveBeenCalledWith("Sam Rivera");
  },
};

/** The last attempt failed, so the reason shows beside the sign button. */
export const SignFailed: Story = {
  args: {
    errorMessage: "This document is locked and can no longer be signed.",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent(
      "locked",
    );
  },
};

/** Signed: locked banner and the signature, with no way to sign again. */
export const Signed: Story = {
  args: { document: signedDocument },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/signed and locked/i)).toBeVisible();
    await expect(canvas.getByText("Sam Rivera")).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Sign document" }),
    ).not.toBeInTheDocument();
  },
};

/** The owner sees the shared copy read-only, with no signing controls. */
export const OwnerPending: Story = {
  args: { viewer: "owner" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/sam@example.com/)).toBeVisible();
    await expect(
      canvas.queryByLabelText("Type your full name to sign"),
    ).not.toBeInTheDocument();
  },
};

/** The owner sees who signed and when. */
export const OwnerSigned: Story = {
  args: { document: signedDocument, viewer: "owner" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(/Signed by sam@example.com/),
    ).toBeVisible();
  },
};
