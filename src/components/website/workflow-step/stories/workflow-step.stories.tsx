import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { WorkflowStep } from "../workflow-step";

const meta = {
  title: "Website/Workflow Step",
  component: WorkflowStep,
  tags: ["ai-generated"],
  args: {
    accent: "bg-play-teal",
    description:
      "Browse the marketplace and add the templates your business will reuse.",
    step: 2,
    title: "Save templates",
  },
  decorators: [
    (Story) => (
      <ol className="max-w-xs p-6">
        <Story />
      </ol>
    ),
  ],
} satisfies Meta<typeof WorkflowStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("02")).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: /save templates/i }),
    ).toBeVisible();
  },
};

export const Last: Story = {
  args: { isLast: true, step: 4, title: "Manage the workspace" },
};
