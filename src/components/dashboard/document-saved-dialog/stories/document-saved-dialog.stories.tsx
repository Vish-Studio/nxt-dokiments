import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { DocumentSavedDialog } from "../document-saved-dialog";

const meta = {
  title: "Dashboard/Document Saved Dialog",
  component: DocumentSavedDialog,
  parameters: { layout: "fullscreen" },
  args: {
    documentName: "Lumina Events Invoice",
    onContinue: fn(),
    onDownload: fn(),
    onShare: fn(),
    open: true,
  },
} satisfies Meta<typeof DocumentSavedDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Offers Share and Download PDF as next steps, plus Continue. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("dialog", { name: "Document saved" }),
    ).toBeVisible();
    await expect(
      canvas.getByText(/is saved and ready to go/),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Share" }));
    await expect(args.onShare).toHaveBeenCalledOnce();

    await userEvent.click(canvas.getByRole("button", { name: "Download PDF" }));
    await expect(args.onDownload).toHaveBeenCalledOnce();

    await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
    await expect(args.onContinue).toHaveBeenCalledOnce();
  },
};

/** With sharing switched off, Download PDF is the only next step. */
export const WithoutSharing: Story = {
  args: { onShare: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button", { name: "Share" })).toBeNull();
    await expect(
      canvas.getByRole("button", { name: "Download PDF" }),
    ).toBeVisible();
  },
};
