import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { TemplatePickerFilters } from "../template-picker-filters";

const meta = {
  title: "Dashboard/Template Picker/Filters",
  component: TemplatePickerFilters,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="max-w-sm p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    documentType: "all",
    documentTypes: ["invoice", "quotation", "contract", "nda", "proposal"],
    onDocumentType: fn(),
    onSearch: fn(),
    search: "",
  },
} satisfies Meta<typeof TemplatePickerFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.click(canvas.getByRole("button", { name: "NDA" }));
    await expect(args.onDocumentType).toHaveBeenCalledWith("nda");
  },
};

/** With text in the box, a clear button empties it. */
export const WithSearch: Story = {
  args: { search: "retainer" },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Clear search" }),
    );
    await expect(args.onSearch).toHaveBeenCalledWith("");
  },
};

/** Phones: the chips scroll sideways instead of wrapping. */
export const Phone: Story = {
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
};
