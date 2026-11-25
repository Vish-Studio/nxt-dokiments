import { TrashIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ModalIcon } from "../modal-icon";

const meta = {
  title: "Commons/Modal Icon",
  component: ModalIcon,
  parameters: { layout: "centered" },
  args: { tone: "info" },
} satisfies Meta<typeof ModalIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every tone side by side: success, info, warning, danger, brand. */
export const AllTones: Story = {
  render: () => (
    <div className="flex gap-3">
      <ModalIcon tone="success" />
      <ModalIcon tone="info" />
      <ModalIcon tone="warning" />
      <ModalIcon tone="danger" />
      <ModalIcon tone="brand" />
    </div>
  ),
};

/** A custom glyph keeps the tone's colours. */
export const CustomIcon: Story = {
  args: { icon: TrashIcon, tone: "danger" },
};
