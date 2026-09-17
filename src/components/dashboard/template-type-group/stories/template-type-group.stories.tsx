import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { marketplaceTemplates } from "@/lib/market-place";
import TemplateTypeGroup from "../template-type-group";

const meta = {
  title: "Dashboard/Template Type Group",
  component: TemplateTypeGroup,
  parameters: { layout: "padded" },
  args: {
    documentType: "invoice",
    templates: marketplaceTemplates.filter((template) => template.documentType === "invoice"),
    onPreview: fn(),
  },
} satisfies Meta<typeof TemplateTypeGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Invoices: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Standard Invoice" })).toBeVisible();
    const cards = canvas.getAllByRole("button", { name: /preview/i });
    await expect(cards).toHaveLength(args.templates.length);
    await userEvent.click(cards[0]);
    await expect(args.onPreview).toHaveBeenCalledWith(args.templates[0]);
  },
};
