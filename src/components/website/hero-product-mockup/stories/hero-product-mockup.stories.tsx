import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";

import { HeroProductMockup } from "../hero-product-mockup";

const meta = {
  title: "Website/Hero Product Mockup",
  component: HeroProductMockup,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-nox-noir p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeroProductMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await waitFor(async () => {
      await expect(
        canvas.getByAltText("Dokiments workspace displayed on a laptop"),
      ).toBeInTheDocument();
    });
    await expect(
      canvas.getByAltText("Dokiments dashboard displayed on a mobile phone"),
    ).toBeInTheDocument();
  },
};
