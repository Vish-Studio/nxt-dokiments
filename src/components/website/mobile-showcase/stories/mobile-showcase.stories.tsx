import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { MobileShowcase } from "../mobile-showcase";

const meta = {
  title: "Website/Mobile Showcase",
  component: MobileShowcase,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MobileShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sharing on: two phones and the signature wording. */
export const SharingOn: Story = {
  args: { sharingEnabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("img")).toHaveLength(2);
    await expect(
      canvas.getByText("Know when it is signed"),
    ).toBeInTheDocument();
  },
};

/** Sharing off: one phone, and nothing about signing. */
export const SharingOff: Story = {
  args: { sharingEnabled: false },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("img")).toHaveLength(1);
    await expect(canvas.queryByText(/signed/i)).toBeNull();
  },
};

export const Phone: Story = {
  args: { sharingEnabled: true },
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
