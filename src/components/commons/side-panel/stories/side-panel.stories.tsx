import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { Button } from "@/components/commons/button/button";

import { SidePanel } from "../side-panel";

const meta = {
  title: "Commons/Side Panel",
  component: SidePanel,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  args: {
    children: <div className="p-6 text-sm text-nox-noir">Panel content goes here.</div>,
    description: "Classic style",
    onClose: () => {},
    open: true,
    title: "Service Contract",
  },
} satisfies Meta<typeof SidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "Service Contract" })).toBeVisible();
    await expect(canvas.getByText("Panel content goes here.")).toBeVisible();
  },
};

export const WithFooter: Story = {
  args: {
    footer: <Button size="sm">Save</Button>,
  },
};

export const Teal: Story = {
  args: { tone: "teal" },
};
