import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { UserDropdown } from "../user-dropdown";

const meta = {
  component: UserDropdown,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof UserDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Anthony Alverizko")).toBeVisible();
  },
};

export const CompactName: Story = {
  args: {
    userInitials: "ND",
    userName: "Dokiments Team",
  },
};
