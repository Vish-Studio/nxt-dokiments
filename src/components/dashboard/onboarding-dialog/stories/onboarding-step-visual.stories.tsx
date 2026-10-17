import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { OnboardingStepVisual } from "../onboarding-step-visual";
import { onboardingSteps } from "../onboarding-steps";

const meta = {
  title: "Dashboard/Onboarding Step Visual",
  component: OnboardingStepVisual,
  args: { ...onboardingSteps[1], isActive: true },
  decorators: [
    (Story) => (
      <div className="relative h-128 w-104 overflow-hidden rounded-box">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OnboardingStepVisual>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A square illustration on its white card. */
export const Framed: Story = {};

/** The welcome visual: wordmark at the top, laptop mockup on the bottom edge. */
export const Hero: Story = {
  args: { ...onboardingSteps[0], isActive: true },
};

/** A product mockup inset on a white card. */
export const Wide: Story = {
  args: { ...onboardingSteps[4], isActive: true },
};
