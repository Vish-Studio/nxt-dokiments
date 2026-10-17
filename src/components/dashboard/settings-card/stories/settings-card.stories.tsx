import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Button } from "@/components/commons/button/button";

import { SettingsCard } from "../settings-card";

const meta = {
  title: "Dashboard/Settings Card",
  component: SettingsCard,
  parameters: { layout: "padded" },
  args: {
    children: <p className="text-sm">Card content</p>,
    title: "Personal information",
  },
} satisfies Meta<typeof SettingsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Personal information" }),
    ).toBeVisible();
  },
};

export const WithActionAndDescription: Story = {
  args: {
    action: (
      <Button size="sm" variant="outline">
        Edit
      </Button>
    ),
    description: "Shown on the documents you create.",
  },
};
