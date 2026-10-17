import { GiftIcon, LockKeyIcon, UserCircleIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";

import { SettingsNav } from "../settings-nav";

const meta = {
  title: "Dashboard/Settings Nav",
  component: SettingsNav,
  parameters: { layout: "padded" },
  args: {
    items: [
      { icon: UserCircleIcon, id: "profile", label: "My profile" },
      { icon: LockKeyIcon, id: "security", label: "Security" },
      { icon: GiftIcon, id: "promotions", label: "Promotions" },
    ],
    onChange: fn(),
    onSignOut: fn(),
    value: "profile",
  },
  decorators: [
    (Story) => (
      <div className="w-60">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  play: async ({ args, canvas }) => {
    await expect(canvas.getByRole("tab", { name: "My profile" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await userEvent.click(canvas.getByRole("tab", { name: "Security" }));
    await expect(args.onChange).toHaveBeenCalledWith("security");

    await userEvent.click(canvas.getByRole("button", { name: "Log out" }));
    await expect(args.onSignOut).toHaveBeenCalledOnce();
  },
};

/** Below `lg`: the horizontal tab bar, without Log out. */
export const Mobile: Story = {
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
  decorators: [
    (Story) => (
      <div className="w-full">
        <Story />
      </div>
    ),
  ],
};
