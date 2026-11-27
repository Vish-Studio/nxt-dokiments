import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { TemplatePickerContextChip } from "../template-picker-context-chip";

const meta = {
  title: "Dashboard/Template Picker/Context Chip",
  component: TemplatePickerContextChip,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="max-w-sm p-4">
        <Story />
      </div>
    ),
  ],
  args: { label: "Northline Studio", onClear: fn() },
} satisfies Meta<typeof TemplatePickerContextChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", {
        name: "Don't prefill Northline Studio",
      }),
    );
    await expect(args.onClear).toHaveBeenCalled();
  },
};

/** A long company name truncates instead of pushing the clear button out. */
export const LongName: Story = {
  args: { label: "Harbour Fit-out & Interior Contracting Company Ltd" },
};
