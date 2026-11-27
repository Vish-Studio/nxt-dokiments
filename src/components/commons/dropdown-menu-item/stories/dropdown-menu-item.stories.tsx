import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { expect, fn, userEvent, within } from "storybook/test";

import { DropdownMenuItem } from "../dropdown-menu-item";

const meta = {
  title: "Commons/Dropdown Menu Item",
  component: DropdownMenuItem,
  args: { children: "Edit", icon: PencilSimpleIcon, onClick: fn() },
  // A menuitem only makes sense inside a menu, as in a real `Dropdown`.
  decorators: [
    (Story) => (
      <div
        aria-label="Example actions"
        className="w-52 rounded-box border border-steel-mist bg-base-100 p-2"
        role="menu"
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DropdownMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A `menuitem` kept out of the Tab order: the Dropdown moves focus with the arrows. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const item = within(canvasElement).getByRole("menuitem", { name: "Edit" });
    await expect(item).toHaveAttribute("tabindex", "-1");
    await userEvent.click(item);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

/** Destructive actions are red. */
export const Danger: Story = {
  args: { children: "Delete", icon: TrashIcon, tone: "danger" },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("menuitem", { name: "Delete" }),
    ).toHaveClass("text-error");
  },
};

/** A disabled item can't be used, and the Dropdown's arrow keys skip it. */
export const Disabled: Story = {
  args: { children: "Move up", disabled: true },
  play: async ({ args, canvasElement }) => {
    const item = within(canvasElement).getByRole("menuitem", {
      name: "Move up",
    });
    await expect(item).toBeDisabled();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
