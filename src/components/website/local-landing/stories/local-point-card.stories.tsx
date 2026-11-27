import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { LocalPointCard } from "../local-point-card";

const meta = {
  title: "Website/Local Point Card",
  component: LocalPointCard,
  args: {
    body: "Write amounts in Mauritian rupees (Rs) or any other currency, so local and overseas clients each get the right invoice.",
    title: "Bill in rupees",
    tone: "bg-golden-harvest",
  },
  decorators: [
    (Story) => (
      <ul className="max-w-md">
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof LocalPointCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 3, name: "Bill in rupees" }),
    ).toBeInTheDocument();
  },
};

export const Blue: Story = {
  args: { title: "BRN and VAT ready", tone: "bg-play-blue" },
};
