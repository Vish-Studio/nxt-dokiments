import { AddressBook } from "@phosphor-icons/react/dist/ssr";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { HeroFeatureTile } from "../hero-feature-tile";

const meta = {
  title: "Website/Hero Feature Tile",
  component: HeroFeatureTile,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <ul className="max-w-xs bg-play-blue p-6">
        <Story />
      </ul>
    ),
  ],
  args: {
    accent: "bg-play-blue",
    icon: AddressBook,
    isActive: true,
    label: "Client",
    onSelect: fn(),
    step: 2,
    title: "Add your client",
  },
} satisfies Meta<typeof HeroFeatureTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const Inactive: Story = {
  args: { isActive: false },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Add your client" }));
    await expect(args.onSelect).toHaveBeenCalled();
  },
};
