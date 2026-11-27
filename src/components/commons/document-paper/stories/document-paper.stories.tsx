import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { TemplateDocument } from "@/components/commons/template-document/template-document";
import { getSampleValues, getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { DocumentPaper } from "../document-paper";

const template = (id: string) => getTemplateById(id) as MarketplaceTemplate;

const meta = {
  title: "Commons/Document Paper",
  component: DocumentPaper,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-base-200 p-6">
        <div className="mx-auto max-w-lg">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    children: (
      <TemplateDocument
        density="compact"
        template={template("modern-quotation")}
        values={getSampleValues("quotation")}
      />
    ),
  },
} satisfies Meta<typeof DocumentPaper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Square corners, no border, the paper shadow, at least one A4 page tall. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const sheet = canvasElement.querySelector(".document-paper-sheet");
    await expect(sheet).not.toBeNull();
    const style = getComputedStyle(sheet as Element);
    await expect(style.borderTopLeftRadius).toBe("0px");
    // The `shadow-paper` drop, not a card shadow.
    await expect(style.boxShadow).toContain("0px 14px 36px");
    const { height, width } = (sheet as Element).getBoundingClientRect();
    await expect(height / width).toBeGreaterThanOrEqual(1.41);
  },
};

/** A short document still fills one A4 page. */
export const ShortDocument: Story = {
  args: {
    children: (
      <TemplateDocument
        density="compact"
        template={template("classic-invoice")}
        values={{}}
      />
    ),
  },
};

/** A CV on paper: the same sheet for every document type. */
export const Cv: Story = {
  args: {
    children: (
      <TemplateDocument
        density="compact"
        template={template("minimalist-cv")}
        values={getSampleValues("cv")}
      />
    ),
  },
};

/** An optional caption under the sheet. */
export const WithCaption: Story = {
  args: { caption: "A4" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("A4")).toBeVisible();
  },
};

export const Phone: Story = {
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
};
