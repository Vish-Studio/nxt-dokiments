import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { SettingsDetailList } from "../settings-detail-list";

const meta = {
  title: "Dashboard/Settings Detail List",
  component: SettingsDetailList,
  parameters: { layout: "padded" },
  args: {
    details: [
      { label: "Display name", value: "Anthony Alverizko" },
      { label: "Full name", value: "Anthony J. Alverizko" },
      { label: "Phone", value: "+230 5 123 4567" },
      { label: "Tel" },
      { label: "Address", value: "12 Rue La Bourdonnais, Port Louis", wide: true },
    ],
  },
} satisfies Meta<typeof SettingsDetailList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // An empty value says so rather than leaving a gap.
    await expect(canvas.getByText("Not set")).toBeVisible();
  },
};
