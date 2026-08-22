import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { ClientListSkeleton } from "../client-list-skeleton";

const meta = {
  title: "Dashboard/Client List Skeleton",
  component: ClientListSkeleton,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClientListSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The one thing assistive tech should get — the shimmer itself is aria-hidden.
    await expect(
      canvas.getByRole("status", { name: /loading your clients/i }),
    ).toBeInTheDocument();

    // Same column header as the loaded list, so the layout doesn't shift on arrival.
    await expect(
      canvasElement.querySelectorAll(".skeleton").length,
    ).toBeGreaterThan(0);
  },
};

export const SingleRow: Story = {
  args: { count: 1 },
};

/** Narrow viewport: company and contact columns collapse, leaving the mobile sub-line. */
export const Mobile: Story = {
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
};
