import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { ProfileFeedbackBanner } from "../profile-feedback-banner";

const meta = {
  title: "Dashboard/Profile Feedback Banner",
  component: ProfileFeedbackBanner,
  tags: ["ai-generated"],
} satisfies Meta<typeof ProfileFeedbackBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    feedback: {
      message: "Profile updated.",
      tone: "success",
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toHaveTextContent("Profile updated.");
  },
};

export const Error: Story = {
  args: {
    feedback: {
      message: "Unable to update profile.",
      tone: "error",
    },
  },
};
