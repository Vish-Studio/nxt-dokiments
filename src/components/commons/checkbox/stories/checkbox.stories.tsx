import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Checkbox } from "../checkbox";

const meta = {
  title: "Commons/Checkbox",
  component: Checkbox,
  tags: ["ai-generated"],
  args: {
    label: "Require approval",
    helperText: "Route this document through the approval workflow.",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("checkbox")).toBeChecked();
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
