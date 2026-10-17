import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { AuthShowcaseStep } from "../auth-showcase-step";

const meta = {
  title: "Commons/Auth Showcase Step",
  component: AuthShowcaseStep,
  decorators: [
    (Story) => (
      <div className="flex w-40 bg-play-teal p-4" role="tablist">
        <Story />
      </div>
    ),
  ],
  args: {
    controls: "auth-showcase-slide-0",
    isActive: true,
    isPaused: false,
    label: "Marketplace",
    onComplete: fn(),
    onSelect: fn(),
  },
} satisfies Meta<typeof AuthShowcaseStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const Inactive: Story = {
  args: { isActive: false },
};

export const Paused: Story = {
  args: { isPaused: true },
};
