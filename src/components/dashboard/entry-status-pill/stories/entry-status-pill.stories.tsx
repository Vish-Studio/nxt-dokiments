import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { EntryStatusPill } from "../entry-status-pill";

const meta = {
  title: "Dashboard/Entry Status Pill",
  component: EntryStatusPill,
  args: { status: "awaiting" },
} satisfies Meta<typeof EntryStatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Awaiting: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("Awaiting signature"),
    ).toBeVisible();
  },
};

export const Signed: Story = { args: { status: "signed" } };
export const Received: Story = { args: { status: "received" } };
export const NotShared: Story = { args: { status: "not-shared" } };

/** All four side by side, to compare the colours. */
export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <EntryStatusPill status="awaiting" />
      <EntryStatusPill status="signed" />
      <EntryStatusPill status="received" />
      <EntryStatusPill status="not-shared" />
    </div>
  ),
};
