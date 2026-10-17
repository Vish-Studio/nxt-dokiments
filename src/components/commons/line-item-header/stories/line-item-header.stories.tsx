import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { LineItemHeader } from "../line-item-header";

const meta = {
  title: "Commons/Line Item Header",
  component: LineItemHeader,
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
    isFirst: true,
    isLast: false,
    onMoveDown: fn(),
    onMoveUp: fn(),
    onRemove: fn(),
  },
} satisfies Meta<typeof LineItemHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstItem: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "More actions for item 1" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Move up" }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: "Move down" }),
    ).toBeEnabled();
  },
};

export const MiddleItem: Story = {
  args: { index: 1, isFirst: false },
};

export const EditingWithDone: Story = {
  args: { index: 1, isFirst: false, onDone: fn() },
};
