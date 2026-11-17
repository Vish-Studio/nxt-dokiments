import { FilePdfIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { DocumentSavedAction } from "../document-saved-action";

const meta = {
  title: "Dashboard/Document Saved Action",
  component: DocumentSavedAction,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
  args: {
    description: "Send it to your client by email.",
    icon: ShareNetworkIcon,
    label: "Share",
    onClick: fn(),
    tone: "teal",
  },
} satisfies Meta<typeof DocumentSavedAction>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Named by its label, described by its one-line copy. */
export const Share: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole("button", { name: "Share" });
    await expect(action).toHaveAccessibleDescription(
      "Send it to your client by email.",
    );
    await userEvent.click(action);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const DownloadPdf: Story = {
  args: {
    description: "Get a print-ready A4 copy.",
    icon: FilePdfIcon,
    label: "Download PDF",
    tone: "purple",
  },
};
