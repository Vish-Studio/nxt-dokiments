import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { HeroDocumentPreview } from "../hero-document-preview";

const meta = {
  title: "Website/Hero Document Preview",
  component: HeroDocumentPreview,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="w-72 bg-play-blue p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeroDocumentPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Invoice: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector(".hero-document-preview"),
    ).not.toBeNull();
  },
};

export const Contract: Story = {
  args: { templateId: "modern-contract" },
};
