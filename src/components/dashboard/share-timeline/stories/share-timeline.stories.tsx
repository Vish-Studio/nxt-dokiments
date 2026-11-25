import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ShareTimeline } from "../share-timeline";

const at = (iso: string) => new Date(iso).getTime();

const meta = {
  title: "Dashboard/Share Timeline",
  component: ShareTimeline,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="max-w-md p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShareTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A share that was opened and signed. */
export const Signed: Story = {
  args: {
    events: [
      {
        at: at("2026-10-20T09:00:00Z"),
        email: "sam@example.com",
        kind: "shared",
      },
      {
        at: at("2026-10-21T13:30:00Z"),
        email: "sam@example.com",
        kind: "viewed",
      },
      {
        at: at("2026-10-21T14:05:00Z"),
        email: "sam@example.com",
        kind: "signed",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    await expect(canvas.getByText("Signed by sam@example.com")).toBeVisible();
  },
};

/** Access taken away before the recipient signed. */
export const Revoked: Story = {
  args: {
    events: [
      {
        at: at("2026-10-20T09:00:00Z"),
        email: "sam@example.com",
        kind: "shared",
      },
      {
        at: at("2026-10-22T10:00:00Z"),
        email: "sam@example.com",
        kind: "revoked",
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText("Access revoked for sam@example.com"),
    ).toBeVisible();
  },
};

/** Nothing to show renders nothing. */
export const Empty: Story = {
  args: { events: [] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("list")).toBeNull();
  },
};
