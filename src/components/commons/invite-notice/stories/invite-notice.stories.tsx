import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Button } from "@/components/commons/button/button";

import { InviteNotice } from "../invite-notice";

const meta = {
  title: "Commons/Invite Notice",
  component: InviteNotice,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="max-w-md p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InviteNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expired: Story = {
  args: { kind: "expired" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("This invitation has expired")).toBeVisible();
  },
};

export const Invalid: Story = {
  args: { kind: "invalid" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("This invitation is no longer valid"),
    ).toBeVisible();
  },
};

export const Mismatch: Story = {
  args: {
    children: <Button>Sign out</Button>,
    invitedEmail: "j***@example.com",
    kind: "mismatch",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/j\*\*\*@example\.com/)).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Sign out" }),
    ).toBeVisible();
  },
};
