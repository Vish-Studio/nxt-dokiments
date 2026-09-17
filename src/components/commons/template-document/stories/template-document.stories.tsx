import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { TemplateDocument } from "../template-document";

const template = getTemplateById("classic-contract") as MarketplaceTemplate;

const meta = {
  title: "Commons/Template Document",
  component: TemplateDocument,
  tags: ["ai-generated"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[600px] bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  args: { template },
} satisfies Meta<typeof TemplateDocument>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    values: {
      fromName: "Dokiments Studio",
      scope: "Design and build a marketing website.",
      title: "Website Build Agreement",
      toName: "Acme Co.",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Website Build Agreement")).toBeVisible();
    await expect(canvas.getByText("Acme Co.")).toBeVisible();
  },
};

export const ModernStyle: Story = {
  args: { template: getTemplateById("modern-invoice") as MarketplaceTemplate },
};

export const LetterOrder: Story = {
  args: {
    template: getTemplateById("classic-formal-business-letter") as MarketplaceTemplate,
    values: { fromName: "Studio", fromAddress: "12 Studio Lane", toName: "Acme", toAddress: "24 Market Street", salutation: "Dear Amelia,", body: "We confirm the renewal.", closing: "Sincerely,", senderSignature: "John Smith" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = canvas.getByText("We confirm the renewal.");
    await expect(canvas.queryByText("From address")).not.toBeInTheDocument();
    await expect(canvas.getByText("Dear Amelia,").compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await expect(body.compareDocumentPosition(canvas.getByText("Sincerely,")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  },
};

export const InvoiceOrder: Story = {
  args: {
    template: getTemplateById("classic-invoice") as MarketplaceTemplate,
    values: { items: "Design services — 1 — $100", total: "$100", paymentInstructions: "Bank transfer" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const total = canvas.getByText("$100");
    await expect(canvas.getByText("Design services — 1 — $100").compareDocumentPosition(total) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await expect(total.compareDocumentPosition(canvas.getByText("Bank transfer")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  },
};
