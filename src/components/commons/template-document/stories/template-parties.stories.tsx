import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { invoice } from "@/lib/market-place/documents";
import { TemplateParties } from "../template-parties";

const meta = {
  title: "Commons/Template Parties",
  component: TemplateParties,
  args: {
    fields: invoice.fields,
    values: { fromName: "Studio", fromAddress: "12 Studio Lane\nPort Louis", toName: "Acme", toAddress: "24 Market Street", toEmail: "accounts@example.com" },
    compact: false,
    labelClassName: "font-title text-xs font-semibold uppercase text-nox-noir/45",
  },
} satisfies Meta<typeof TemplateParties>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("From")).toBeVisible();
    await expect(canvas.getByText("To")).toBeVisible();
    await expect(canvas.queryByText("From address")).not.toBeInTheDocument();
    await expect(canvas.getByText("accounts@example.com")).toBeVisible();
  },
};
