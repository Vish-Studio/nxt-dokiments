import { AddressBookIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { ClientSourceOption } from "../client-source-option";

const meta = {
  title: "Dashboard/Client Source Option",
  component: ClientSourceOption,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="max-w-xs bg-base-100 p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    accent: "bg-play-blue",
    detail: "Pick from My Clients",
    icon: AddressBookIcon,
    isSelected: true,
    label: "Saved client",
    onSelect: fn(),
  },
} satisfies Meta<typeof ClientSourceOption>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Selected: Story = {};

export const Unselected: Story = {
  args: { isSelected: false },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("radio", { name: /saved client/i }),
    );
    await expect(args.onSelect).toHaveBeenCalled();
  },
};
