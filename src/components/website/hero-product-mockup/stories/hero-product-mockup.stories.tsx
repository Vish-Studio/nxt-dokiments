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
    const laptop = await canvas.findByAltText(
      "Dokiments workspace displayed on a laptop",
    );
    const mobile = canvas.getByAltText(
      "Dokiments dashboard displayed on a mobile phone",
    );

    await waitFor(() => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        expect(laptop).toBeVisible();
        expect(mobile).not.toBeVisible();
      } else {
        expect(mobile).toBeVisible();
        expect(laptop).not.toBeVisible();
      }
    });
  },
};

export const Mobile: Story = {
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
  play: Default.play,
};
