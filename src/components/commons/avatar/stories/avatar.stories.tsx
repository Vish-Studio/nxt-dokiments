import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { Avatar } from "../avatar";

const meta = {
  title: "Commons/Avatar",
  component: Avatar,
  tags: ["ai-generated"],
  parameters: { layout: "centered" },
  args: {
    className: "bg-nox-noir text-white",
    name: "Anthony Alverizko",
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("AA")).toBeVisible();
  },
};

export const Large: Story = {
  args: { size: "lg" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("AA")).toBeVisible();
  },
};

export const NoUser: Story = {
  args: { name: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("AA")).not.toBeInTheDocument();
  },
};

export const WithImage: Story = {
  args: {
    imageUrl:
      "https://images.unsplash.com/photo-1752137666154-34d38ba92dd7?w=128&q=80",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("img", { name: /anthony alverizko's avatar/i }),
    ).toBeVisible();
  },
};
