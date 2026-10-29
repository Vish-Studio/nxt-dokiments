import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { DocumentListItem } from "../document-list-item";

const document = {
  createdAt: new Date("2026-06-18T09:30:00Z").getTime(),
  id: "doc-story-1",
  name: "June Retainer Invoice",
  templateId: "classic-invoice",
  templateSnapshot: {
    description: "",
    documentType: "contract" as const,
    fields: [
      {
        key: "recipientSignature",
        label: "Recipient signature",
        type: "text" as const,
      },
    ],
    name: "Contract",
    style: {
      description: "",
      id: "classic" as const,
      name: "Classic",
      tier: "free" as const,
    },
  },
  updatedAt: new Date("2026-06-18T09:30:00Z").getTime(),
  values: { title: "Lumina Events Invoice" },
};

const documentTitle = document.values.title;

const meta = {
  title: "Dashboard/Document List Item",
  component: DocumentListItem,
  decorators: [
    (Story) => (
      <ol className="overflow-hidden rounded-box border border-steel-mist bg-base-100">
        <Story />
      </ol>
    ),
  ],
  args: {
    document,
    onEdit: fn(),
    onPreview: fn(),
    onPrint: fn(),
  },
} satisfies Meta<typeof DocumentListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rowButton = canvas.getByRole("button", {
      name: `Open preview for ${documentTitle}`,
    });
    const printButton = canvas.getByRole("button", {
      name: `Print ${documentTitle}`,
    });
    const editButton = canvas.getByRole("button", {
      name: `Edit ${documentTitle}`,
    });
    await expect(canvas.getByText(documentTitle)).toBeVisible();
    await userEvent.click(rowButton);
    await expect(meta.args.onPreview).toHaveBeenCalledOnce();
    await userEvent.click(printButton);
    await expect(meta.args.onPrint).toHaveBeenCalledOnce();
    await userEvent.click(editButton);
    await expect(meta.args.onEdit).toHaveBeenCalledOnce();
  },
};

export const WithShare: Story = {
  args: { onShare: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: `More actions for ${documentTitle}` }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Share" }));
    await expect(args.onShare).toHaveBeenCalledWith(document);
  },
};

/** A shared document also offers its shared copy, for watching the signature. */
export const WithViewShared: Story = {
  args: { onShare: fn(), onViewShared: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: `More actions for ${documentTitle}` }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "View shared copy" }),
    );
    await expect(args.onViewShared).toHaveBeenCalledWith(document);
  },
};

export const WithoutShare: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole("button", {
        name: `More actions for ${documentTitle}`,
      }),
    ).toBeNull();
  },
};
