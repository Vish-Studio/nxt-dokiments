import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { OnboardingStepIndicator } from "../onboarding-step-indicator";

const meta = {
  title: "Dashboard/Onboarding Step Indicator",
  component: OnboardingStepIndicator,
  args: { activeIndex: 0, total: 6 },
} satisfies Meta<typeof OnboardingStepIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {
  play: async ({ canvasElement }) => {
    // Reads "Step 1 of 3" aloud; the slash is aria-hidden.
    await expect(canvasElement.querySelector("p")).toHaveTextContent(
      "Step 1/ of 6",
    );
  },
};

export const LastStep: Story = {
  args: { activeIndex: 5 },
};
