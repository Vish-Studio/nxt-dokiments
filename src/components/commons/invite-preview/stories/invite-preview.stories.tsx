import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { LinkButton } from "@/components/commons/link-button/link-button";

import { InvitePreview } from "../invite-preview";

const meta = {
  title: "Commons/Invite Preview",
  component: InvitePreview,
  tags: ["ai-generated"],
  args: {
    documentName: "Website redesign NDA",
    senderEmail: "alex@example.com",
    senderName: "Alex Morgan",
  },
  decorators: [
    (Story) => (
      <div className="max-w-md p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InvitePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <LinkButton href="/sign-up">Sign up to sign</LinkButton>
        <LinkButton
          href="/sign-in"
          variant="outline"
        >
          Sign in
        </LinkButton>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Website redesign NDA")).toBeVisible();
    await expect(canvas.getByText(/Shared by Alex Morgan/)).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "Sign up to sign" }),
    ).toBeVisible();
  },
};

export const WithoutActions: Story = {};
