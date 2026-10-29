import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { SignedSignature } from "../signed-signature";

const meta = {
  title: "Dashboard/Signed Signature",
  component: SignedSignature,
  tags: ["ai-generated"],
  args: {
    signature: {
      email: "sam@example.com",
      signedAt: new Date("2026-10-21T14:05:00Z").getTime(),
      type: "typed",
      value: "Sam Rivera",
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-white p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignedSignature>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The typed name, with the signer's address and the time it was signed. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Sam Rivera")).toBeVisible();
    await expect(canvas.getByText(/sam@example.com/)).toBeVisible();
  },
};
