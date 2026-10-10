import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";

import { FeatureTabButton } from "../feature-tab-button";

const meta = {
  title: "Website/Feature Tab Button",
  component: FeatureTabButton,
  tags: ["ai-generated"],
  args: {
    description: "Preview any template before you commit to it.",
    href: "/marketplace",
    id: "marketplace",
    isActive: true,
    linkLabel: "Browse the marketplace",
    onSelect: () => undefined,
    title: "Find the right template fast.",
  },
  decorators: [
    (Story) => (
      <ul className="max-w-md p-6">
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof FeatureTabButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await waitFor(async () => {
      await expect(
        canvas.getByRole("link", { name: /browse the marketplace/i }),
      ).toBeVisible();
    });
  },
};

export const Inactive: Story = {
  args: { isActive: false },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(canvas.queryByRole("link")).toBeNull();
  },
};
