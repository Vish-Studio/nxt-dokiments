import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { Carousel } from "../carousel";

const meta = {
  title: "Commons/Carousel",
  component: Carousel,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="max-w-2xl bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    ariaLabel: "Demo items",
    children: Array.from({ length: 6 }, (_, index) => (
      <div
        className="flex h-32 w-48 shrink-0 snap-start items-center justify-center rounded-box border border-steel-mist bg-base-100 font-title font-bold text-nox-noir"
        key={index}
      >
        Card {index + 1}
      </div>
    )),
  },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Card 1")).toBeVisible();
    await expect(canvas.getByRole("button", { name: /next slide/i })).toBeVisible();
  },
};
