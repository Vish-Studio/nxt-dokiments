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

/** The recipient opened the document but hasn't signed it yet. */
export const Viewed: Story = {
  args: { status: "viewed" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Viewed")).toBeVisible();
  },
};

export const Signed: Story = { args: { status: "signed" } };
export const Received: Story = { args: { status: "received" } };
export const NotShared: Story = { args: { status: "not-shared" } };

/** All five side by side: a coloured dot, then the word. */
export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <EntryStatusPill status="awaiting" />
      <EntryStatusPill status="viewed" />
      <EntryStatusPill status="signed" />
      <EntryStatusPill status="received" />
      <EntryStatusPill status="not-shared" />
    </div>
  ),
};

/** The dot is decorative: hidden from assistive tech, the word is the name. */
export const DotIsDecorative: Story = {
  args: { status: "viewed" },
  play: async ({ canvasElement }) => {
    const dot = canvasElement.querySelector(".status-dot");
    await expect(dot).toHaveAttribute("aria-hidden", "true");
    await expect(within(canvasElement).getByText("Viewed")).toBeVisible();
  },
};

export const AllStatusesPhone: Story = {
  ...AllStatuses,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
