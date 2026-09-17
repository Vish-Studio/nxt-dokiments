import { PlusIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { FloatingActionButton } from "../floating-action-button";

const meta = {
  title: "Commons/Floating Action Button",
  component: FloatingActionButton,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
  args: {
    icon: (
      <PlusIcon
        aria-hidden
        size={18}
        weight="bold"
      />
    ),
    label: "New document",
    onClick: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="min-h-96 bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FloatingActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: /new document/i }),
    ).toBeVisible();
  },
};

/**
 * `shape="circle"` drops the labelled pill entirely, so the icon-only button is
 * the single rendered control at every breakpoint — the label survives only as
 * the accessible name.
 */
export const Circle: Story = {
  args: { shape: "circle" },
  play: async ({ canvas }) => {
    const buttons = canvas.getAllByRole("button", { name: /new document/i });
    await expect(buttons).toHaveLength(1);
    await expect(buttons[0]).toBeVisible();
    // The pill's visible text must be absent — only the aria-label names it.
    await expect(canvas.queryByText("New document")).not.toBeInTheDocument();
  },
};

/** Passing `href` swaps the button for a `next/link` anchor. */
export const AsLink: Story = {
  args: {
    href: "/my-documents?new=1",
    onClick: undefined,
    shape: "circle",
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: /new document/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/my-documents?new=1");
    await expect(
      canvas.queryByRole("button", { name: /new document/i }),
    ).not.toBeInTheDocument();
  },
};
