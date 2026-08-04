import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { DocumentListItem } from "../document-list-item";

const document = {
  createdAt: new Date("2026-06-18T09:30:00Z").getTime(),
  id: "doc-story-1",
  name: "June Retainer Invoice",
  templateId: "classic-invoice",
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
    const rowButton = canvas.getByRole("button", { name: `Open preview for ${documentTitle}` });
    const printButton = canvas.getByRole("button", { name: `Print ${documentTitle}` });
    const editButton = canvas.getByRole("button", { name: `Edit ${documentTitle}` });
    await expect(canvas.getByText(documentTitle)).toBeVisible();
    await userEvent.click(rowButton);
    await expect(meta.args.onPreview).toHaveBeenCalledOnce();
    await userEvent.click(printButton);
    await expect(meta.args.onPrint).toHaveBeenCalledOnce();
    await userEvent.click(editButton);
    await expect(meta.args.onEdit).toHaveBeenCalledOnce();
  },
};
