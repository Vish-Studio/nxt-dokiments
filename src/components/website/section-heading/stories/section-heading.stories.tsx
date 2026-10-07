import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { SectionHeading } from "../section-heading";

const meta = {
  title: "Website/Section Heading",
  component: SectionHeading,
  tags: ["ai-generated"],
  args: {
    description:
      "Browse the marketplace, save what you trust, and create documents.",
    highlight: "in one place.",
    title: "Your whole document workspace, in one place.",
  },
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Left: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: /whole document workspace/i }),
    ).toBeVisible();
    await expect(canvas.getByText("in one place.")).toBeVisible();
  },
};

export const Centered: Story = {
  args: { align: "center", eyebrow: "Workspace" },
};

export const Dark: Story = {
  args: { eyebrow: "Customer stories", tone: "dark" },
  decorators: [
    (Story) => (
      <div className="bg-nox-noir p-10">
        <Story />
      </div>
    ),
  ],
};
