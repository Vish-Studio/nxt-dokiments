import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { AuthProvider } from "../auth-provider";

const meta = {
  title: "Commons/Auth Provider",
  component: AuthProvider,
  tags: ["ai-generated"],
  args: {
    children: <p>Auth boundary content</p>,
  },
} satisfies Meta<typeof AuthProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Auth boundary content")).toBeVisible();
  },
};
