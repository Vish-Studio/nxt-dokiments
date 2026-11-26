import { FilePdfIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { EditorActionButton } from "../editor-action-button";

const meta = {
  title: "Dashboard/Editor Action Button",
  component: EditorActionButton,
  args: {
    icon: ShareNetworkIcon,
    label: "Share",
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div className="inline-flex rounded-full bg-app-chrome p-2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EditorActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Desktop: the icon alone; hover or keyboard focus slides the label out to its
 * right (tested with Tab, since a synthetic hover can't trigger CSS `:hover`).
 * The label is always the accessible name.
 */
export const Default: Story = {
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole("button", { name: "Share" });
    const label = canvas.getByText("Share");
    await expect(label.getBoundingClientRect().width).toBe(0);

    await userEvent.tab();
    await expect(button).toHaveFocus();
    await waitFor(async () => {
      await expect(label.getBoundingClientRect().width).toBeGreaterThan(0);
    });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const DownloadPdf: Story = {
  args: { icon: FilePdfIcon, label: "Download PDF" },
};
