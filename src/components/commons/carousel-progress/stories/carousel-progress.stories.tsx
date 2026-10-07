import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CarouselProgress } from "../carousel-progress";

const meta = {
  title: "Commons/Carousel Progress",
  component: CarouselProgress,
  args: { current: 1, total: 4 },
  parameters: { layout: "padded" },
} satisfies Meta<typeof CarouselProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const First: Story = {};

export const Later: Story = {
  args: { current: 3 },
};
