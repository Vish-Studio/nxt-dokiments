import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { TemplatePreviewDialog } from "../template-preview-dialog";

const template = getTemplateById("modern-quotation") as MarketplaceTemplate;

const meta = {
  title: "Commons/Template Preview Dialog",
  component: TemplatePreviewDialog,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  args: {
    onClose: () => {},
    onSave: () => {},
    template,
  },
} satisfies Meta<typeof TemplatePreviewDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: /save template/i }),
    ).toBeVisible();
  },
};

export const SaveLoading: Story = {
  args: { saveLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: /save template/i }),
    ).toBeDisabled();
  },
};

export const Locked: Story = {
  args: { locked: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("link", { name: /upgrade to use/i }),
    ).toBeVisible();
  },
};

export const LibraryActions: Story = {
  args: {
    mode: "library",
    onPrint: () => {},
    useHref: "/my-documents?template=modern-quotation",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: /print template/i }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: /use document/i }),
    ).toBeVisible();
  },
};

/** A saved document: the header card gets "Document" and "Template" tabs. */
export const DocumentDetails: Story = {
  args: {
    details: [
      { label: "Client", value: "Northline Studio" },
      { label: "Amount", value: "1,250.00" },
      { label: "Status", value: "Awaiting signature" },
      { label: "Created", value: "18/06/26, 09:30" },
      { label: "Last edited", value: "19/06/26, 16:05" },
    ],
    documentName: "June retainer quotation",
    mode: "document",
    onDelete: () => {},
    onEdit: () => {},
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const details = await body.findByRole("tabpanel", {
      name: "Document details",
    });
    await expect(within(details).getByText("Awaiting signature")).toBeVisible();
    await userEvent.click(body.getByRole("tab", { name: "Template" }));
    await expect(
      body.getByRole("tabpanel", { name: "Template details" }),
    ).toBeVisible();
    await expect(body.queryByRole("tabpanel", { name: "Document details" })).toBeNull();
  },
};

export const DocumentDetailsPhone: Story = {
  ...DocumentDetails,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
