import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { CvShowcaseMockup } from "../cv-showcase-mockup";

const meta = {
  title: "Website/CV Showcase Mockup",
  component: CvShowcaseMockup,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CvShowcaseMockup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The student's CV in the classic, modern and minimal styles. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const mockup = canvasElement.querySelector(".cv-showcase-mockup");
    await expect(mockup).toHaveAttribute("aria-hidden", "true");
    await expect(mockup).toHaveAttribute("inert");
    await expect(
      canvasElement.querySelectorAll(".showcase-document"),
    ).toHaveLength(3);
    await expect(mockup).toHaveTextContent("Priya Ramdin");
  },
};

export const Phone: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
