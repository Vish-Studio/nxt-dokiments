import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { StyleSwitcherButton } from "../style-switcher-button";

const meta = {
  title: "Website/Style Switcher Button",
  component: StyleSwitcherButton,
  tags: ["ai-generated"],
  args: {
    description:
      "Bold headers and accent blocks for a confident, branded look.",
    isActive: false,
    name: "Modern",
    onSelect: () => undefined,
    tierLabel: "Silver",
    tierVariant: "silver",
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-nox-noir p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StyleSwitcherButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(canvas.getByText("Silver")).toBeVisible();
  },
};

export const Active: Story = {
  args: { isActive: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};
