import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { LineItemMenu } from "../line-item-menu";

const meta = {
  title: "Commons/Line Item Menu",
  component: LineItemMenu,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="flex h-60 max-w-md justify-end bg-base-100 p-6">
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
} satisfies Meta<typeof LineItemMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstItem: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "More actions for item 1" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Move up" }),
    ).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Move down" }));
    await expect(args.onMoveDown).toHaveBeenCalled();
    await expect(
      canvas.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  },
};
