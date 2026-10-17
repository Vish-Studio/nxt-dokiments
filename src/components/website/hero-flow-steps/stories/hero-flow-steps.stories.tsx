import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HeroFlowSteps } from "../hero-flow-steps";

const meta = {
  title: "Website/Hero Flow Steps",
  component: HeroFlowSteps,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="bg-white p-6 text-nox-noir">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeroFlowSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
