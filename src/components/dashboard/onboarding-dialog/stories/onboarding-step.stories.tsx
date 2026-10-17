import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { OnboardingStep } from "../onboarding-step";
import { onboardingSteps } from "../onboarding-steps";

const meta = {
  title: "Dashboard/Onboarding Step",
  component: OnboardingStep,
  args: {
    ...onboardingSteps[0],
    eyebrow: onboardingSteps[0].area,
    titleId: "onboarding-step-title",
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-base-100 p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OnboardingStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Welcome to Dokiments" }),
    ).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
  },
};

export const Marketplace: Story = {
  args: { ...onboardingSteps[1], eyebrow: onboardingSteps[1].area },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Marketplace")).toBeVisible();
  },
};

export const Clients: Story = {
  args: { ...onboardingSteps[4], eyebrow: onboardingSteps[4].area },
};
