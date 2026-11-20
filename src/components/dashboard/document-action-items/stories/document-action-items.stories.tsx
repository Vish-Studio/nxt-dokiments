import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate, UserDocument } from "@/types/template";

import { DocumentActionItems } from "../document-action-items";

const template = getTemplateById("classic-invoice") as MarketplaceTemplate;

const document: UserDocument = {
  createdAt: new Date("2026-06-18T09:30:00").getTime(),
  id: "doc-1",
  name: "June retainer invoice",
  templateId: template.id,
  templateSnapshot: {
    description: template.description,
    documentType: template.documentType,
    fields: template.fields,
    name: template.name,
    style: template.style,
  },
  updatedAt: new Date("2026-06-18T09:30:00").getTime(),
  values: { title: "June retainer invoice" },
};

const meta = {
  title: "Dashboard/Document Action Items",
  component: DocumentActionItems,
  args: { document, onDownload: fn(), onEdit: fn() },
  decorators: [
    (Story) => (
      <div className="w-52 rounded-box border border-steel-mist bg-base-100 p-1">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DocumentActionItems>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Only the required actions: Edit and Download PDF. */
export const Minimal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole("button").map((b) => b.textContent),
    ).toEqual(["Edit", "Download PDF"]);
  },
};

/** Every action, in order, with Delete last and in red. */
export const AllActions: Story = {
  args: {
    onDelete: fn(),
    onDuplicate: fn(),
    onShare: fn(),
    onViewShared: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole("button").map((b) => b.textContent),
    ).toEqual([
      "Edit",
      "Download PDF",
      "Duplicate",
      "Share",
      "View shared copy",
      "Delete",
    ]);
    await userEvent.click(canvas.getByRole("button", { name: "Delete" }));
    await expect(args.onDelete).toHaveBeenCalledWith(document);
  },
};
