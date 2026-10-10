import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { StepIndicator } from "../step-indicator";

const meta = {
  title: "Commons/Step Indicator",
  component: StepIndicator,
  args: { current: 1, total: 4 },
  parameters: { layout: "padded" },
} satisfies Meta<typeof StepIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const First: Story = {
  play: async ({ canvasElement }) => {
    // Read as "Step 1 of 4"; the slash is aria-hidden.
    await expect(canvasElement.querySelector("p")).toHaveTextContent(
      "Step 1/ of 4",
    );
  },
};

export const Later: Story = {
  args: { current: 3 },
};

/** Carousels name their items slides. */
export const Slides: Story = {
  args: { current: 2, label: "Slide" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("p")).toHaveTextContent(
      "Slide 2/ of 4",
    );
  },
};
