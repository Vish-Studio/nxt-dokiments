import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { HeroTypedHeadline } from "../hero-typed-headline";

const meta = {
  title: "Website/Hero Typed Headline",
  component: HeroTypedHeadline,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="max-w-xl bg-golden-harvest p-10">
        <Story />
      </div>
    ),
  ],
  args: {
    className:
      "font-title text-5xl font-bold leading-[1.05] tracking-tight text-nox-noir",
    highlight: "blank page.",
    lead: "Business documents without the",
    startDelay: 0.2,
    stepDelay: 0.028,
  },
} satisfies Meta<typeof HeroTypedHeadline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", {
        level: 1,
        name: "Business documents without the blank page.",
      }),
    ).toBeInTheDocument();
  },
};
