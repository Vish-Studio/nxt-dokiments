import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AuthShowcaseSlide } from "../auth-showcase-slide";
import { authShowcaseSlides } from "../auth-showcase-slides";

const meta = {
  title: "Commons/Auth Showcase Slide",
  component: AuthShowcaseSlide,
  decorators: [
    (Story) => (
      <div className="relative h-screen max-w-3xl overflow-hidden rounded-box">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "padded" },
  args: {
    ...authShowcaseSlides[0],
    id: "auth-showcase-slide-story",
    isActive: true,
  },
} satisfies Meta<typeof AuthShowcaseSlide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Framed: Story = {};

export const Wide: Story = {
  args: authShowcaseSlides[3],
};
