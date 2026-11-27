import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { TemplatePickerRow } from "../template-picker-row";

const meta = {
  title: "Dashboard/Template Picker/Row",
  component: TemplatePickerRow,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="max-w-sm border-y border-steel-mist bg-base-100">
        <Story />
      </div>
    ),
  ],
  args: {
    caption: "Classic · used 2 days ago",
    onActivate: fn(),
    template: getTemplateById("classic-invoice") as MarketplaceTemplate,
  },
} satisfies Meta<typeof TemplatePickerRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const row = within(canvasElement).getByRole("button", {
      name: "Invoice, Classic · used 2 days ago",
    });
    await userEvent.click(row);
    await expect(args.onActivate).toHaveBeenCalled();
  },
};

/** Desktop selection: golden edge and `aria-current`. */
export const Selected: Story = {
  args: { isSelected: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button")).toHaveAttribute(
      "aria-current",
      "true",
    );
  },
};

export const Phone: Story = {
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
};
