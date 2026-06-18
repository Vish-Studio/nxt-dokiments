import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { Select } from "../select";

const meta = {
  component: Select,
  tags: ["ai-generated"],
  args: {
    label: "Document type",
    "aria-label": "Document type",
    options: [
      { label: "Agreement", value: "agreement" },
      { label: "Invoice", value: "invoice" },
      { label: "Policy", value: "policy" },
    ],
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    defaultValue: "invoice",
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("combobox")).toHaveValue("invoice");
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
