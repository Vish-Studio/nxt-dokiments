import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { DocumentExportDialog } from "../document-export-dialog";

const template = getTemplateById("classic-contract") as MarketplaceTemplate;

const meta = {
  title: "Dashboard/Document Export Dialog",
  component: DocumentExportDialog,
  args: {
    documentName: "Client Service Agreement",
    generatePdf: async () => new Blob(["pdf"], { type: "application/pdf" }),
    onClose: fn(),
    open: true,
    template,
    values: { title: "Lumina Events - DejaVue" },
  },
} satisfies Meta<typeof DocumentExportDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: "Download PDF" })).toBeVisible();
  },
};

export const Generating: Story = {
  args: {
    generatePdf: () => new Promise(() => {}),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Preparing your document")).toBeVisible();
  },
};

export const Failure: Story = {
  args: {
    generatePdf: async () => Promise.reject(new Error("Generation failed")),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("PDF could not be created")).toBeVisible();
  },
};
