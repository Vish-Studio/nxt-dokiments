import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { LineItemSummary } from "../line-item-summary";

const meta = {
  title: "Commons/Line Item Summary",
  component: LineItemSummary,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="max-w-md bg-base-100 p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    index: 0,
    item: {
      description:
        "Download link to be added in the ikigai website for the new Maths document, plus a long tail to check wrapping",
      quantity: "6",
      price: "2600",
    },
    isFirst: true,
    isLast: false,
    onEdit: fn(),
    onMoveDown: fn(),
    onMoveUp: fn(),
    onRemove: fn(),
  },
} satisfies Meta<typeof LineItemSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Edit item 1" }),
    );
    await expect(args.onEdit).toHaveBeenCalled();
  },
};

export const EmptyItem: Story = {
  args: { item: { description: "", quantity: "1", price: "" } },
};
