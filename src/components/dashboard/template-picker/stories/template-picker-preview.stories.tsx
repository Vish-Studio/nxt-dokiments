import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

import { TemplatePickerPreview } from "../template-picker-preview";

const meta = {
  title: "Dashboard/Template Picker/Preview",
  component: TemplatePickerPreview,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex h-[44rem] flex-col bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    onPreview: fn(),
    onUse: fn(),
    template: getTemplateById("modern-invoice") as MarketplaceTemplate,
  },
} satisfies Meta<typeof TemplatePickerPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole("button", { name: "Use this template" }),
    );
    await expect(args.onUse).toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole("button", { name: "Preview full size" }),
    );
    await expect(args.onPreview).toHaveBeenCalled();
  },
};

export const Contract: Story = {
  args: {
    template: getTemplateById("modern-contract") as MarketplaceTemplate,
  },
};
