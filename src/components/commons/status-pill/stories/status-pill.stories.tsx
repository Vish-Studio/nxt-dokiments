import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { StatusPill } from "../status-pill";

const meta = {
  title: "Commons/Status Pill",
  component: StatusPill,
  args: { children: "Awaiting signature", tone: "golden" },
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A dot, then the word; the word is the accessible text. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const pill = canvasElement.querySelector(".status-pill") as HTMLElement;
    await expect(pill.querySelector(".status-dot")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(
      within(canvasElement).getByText("Awaiting signature"),
    ).toBeVisible();
    await expect(getComputedStyle(pill).borderTopLeftRadius).not.toBe("0px");
  },
};

/** Every tone, as used across the document lists. */
export const AllTones: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusPill tone="golden">Awaiting signature</StatusPill>
      <StatusPill tone="blue">Viewed</StatusPill>
      <StatusPill tone="green">Signed</StatusPill>
      <StatusPill tone="teal">Received</StatusPill>
      <StatusPill tone="grey">Not shared</StatusPill>
    </div>
  ),
};
