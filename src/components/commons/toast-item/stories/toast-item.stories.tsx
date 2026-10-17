import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { ToastItem } from "../toast-item";

const meta = {
  title: "Commons/Toast Item",
  component: ToastItem,
  tags: ["ai-generated"],
  args: {
    onDismiss: fn(),
    toast: { id: 1, message: "Profile updated.", tone: "success" },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ToastItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("Profile updated.");
    await userEvent.click(
      canvas.getByRole("button", { name: "Dismiss notification" }),
    );
    await expect(args.onDismiss).toHaveBeenCalledWith(1);
  },
};

export const ErrorTone: Story = {
  args: {
    toast: { id: 2, message: "Unable to update profile.", tone: "error" },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toBeVisible();
  },
};
