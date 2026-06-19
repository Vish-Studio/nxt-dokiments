import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ProfileSummary } from "../profile-summary";

const meta = {
  component: ProfileSummary,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-80 bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    user: {
      address: "12 Market Street, Lisbon",
      companyName: "Dokiments Inc.",
      displayName: "Anthony Alverizko",
      email: "anthony@dokiments.com",
      fullName: "Anthony R. Alverizko",
      phone: "+351 900 000 000",
      role: "silver",
      tel: "+351 210 000 000",
      uid: "story-uid",
    },
  },
} satisfies Meta<typeof ProfileSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Anthony Alverizko")).toBeVisible();
    await expect(canvas.getByText("Dokiments Inc.")).toBeVisible();
    await expect(canvas.getByText(/silver plan/i)).toBeVisible();
  },
};

export const Empty: Story = {
  args: {
    user: {
      address: "",
      companyName: "",
      displayName: "New User",
      email: "new@dokiments.com",
      role: "free",
      uid: "story-uid-2",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("Not set").length).toBeGreaterThan(0);
  },
};
