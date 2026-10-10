import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { ProfileOverviewCard } from "../profile-overview-card";

const meta = {
  title: "Dashboard/Profile Overview Card",
  component: ProfileOverviewCard,
  parameters: { layout: "padded" },
  args: {
    user: {
      displayName: "Anthony Alverizko",
      email: "anthony@dokiments.com",
      provider: "password",
      role: "free",
      uid: "story-uid",
    },
  },
} satisfies Meta<typeof ProfileOverviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Free plan")).toBeVisible();
    await expect(canvas.getByText("Email and password")).toBeVisible();
    // Nothing that fills a document has been added yet.
    await expect(canvas.getByText("0 of 6 added")).toBeVisible();
  },
};

export const GoogleGoldUser: Story = {
  args: {
    user: {
      address: "12 Rue La Bourdonnais, Port Louis",
      brn: "C12345678",
      companyName: "Northline Studio",
      displayName: "Maya Chen",
      email: "maya@northline.com",
      provider: "google",
      role: "gold",
      uid: "story-uid",
    },
  },
};
