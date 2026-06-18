import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { ContentContainer } from "../content-container";

const meta = {
  component: ContentContainer,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ContentContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  render: (args) => (
    <div className="flex h-[520px] bg-app-panel pt-8">
      <ContentContainer {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByTestId("content-surface")).toBeVisible();
  },
};

export const WithContent: Story = {
  render: (args) => (
    <div className="flex h-[520px] bg-app-panel pt-8">
      <ContentContainer {...args}>
        <div className="font-title text-sm font-semibold text-nox-noir/60">
          Dashboard content slot
        </div>
      </ContentContainer>
    </div>
  ),
};
