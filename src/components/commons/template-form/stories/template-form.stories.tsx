import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { TemplateForm } from "../template-form";

const template = getTemplateById("classic-invoice") as MarketplaceTemplate;

const meta = {
  title: "Commons/Template Form",
  component: TemplateForm,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    fields: template.fields,
    onChange: () => {},
    values: { invoiceNumber: "INV-0001" },
  },
} satisfies Meta<typeof TemplateForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByDisplayValue("INV-0001")).toBeVisible();
  },
};

const cvTemplate = getTemplateById("classic-cv") as MarketplaceTemplate;

export const Cv: Story = {
  args: {
    fields: cvTemplate.fields,
    values: { fullName: "Alex Morgan", jobTitle: "Financial Analyst" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByDisplayValue("Alex Morgan")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /^Experience/ }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /^Education \(optional\)/ }),
    ).toBeVisible();
  },
};

const ndaTemplate = getTemplateById("classic-nda") as MarketplaceTemplate;

/** `fieldSlots` swaps a field's input out, e.g. the recipient signature once the document is shared. */
export const WithFieldSlot: Story = {
  args: {
    fields: ndaTemplate.fields,
    fieldSlots: {
      recipientSignature: <p>Waiting for sam@example.com to sign</p>,
    },
    values: {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^Signatures/ }));
    await expect(
      canvas.getByText("Waiting for sam@example.com to sign"),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("textbox", { name: /recipient signature/i }),
    ).toBeNull();
  },
};
