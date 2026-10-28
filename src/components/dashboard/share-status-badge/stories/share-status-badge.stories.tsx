import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ShareStatusBadge } from "../share-status-badge";

const meta = {
  title: "Dashboard/Share Status Badge",
  component: ShareStatusBadge,
  tags: ["ai-generated"],
} satisfies Meta<typeof ShareStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Awaiting the recipient — the default state after a share. */
export const Pending: Story = {
  args: { status: "pending" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Pending")).toBeVisible();
  },
};

/** The recipient has opened the document. */
export const Viewed: Story = {
  args: { status: "viewed" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Viewed")).toBeVisible();
  },
};

/** The recipient has signed. */
export const Signed: Story = {
  args: { status: "signed" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Signed")).toBeVisible();
  },
};

/** The sender withdrew access. */
export const Revoked: Story = {
  args: { status: "revoked" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Revoked")).toBeVisible();
  },
};
