import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { HeroHeadline } from "../hero-headline";

const meta = {
  title: "Website/Hero Headline",
  component: HeroHeadline,
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
  },
} satisfies Meta<typeof HeroHeadline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The whole headline is in the page at once; the highlight is a white mark. */
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
