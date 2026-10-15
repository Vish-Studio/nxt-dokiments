import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { DokimentsMark } from "../dokiments-mark";

const meta = {
  title: "Commons/Dokiments Mark",
  component: DokimentsMark,
  args: { className: "h-10 w-9 text-nox-noir" },
} satisfies Meta<typeof DokimentsMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTitle: Story = {
  args: { title: "Dokiments" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("img", { name: "Dokiments" })).toBeInTheDocument();
  },
};
