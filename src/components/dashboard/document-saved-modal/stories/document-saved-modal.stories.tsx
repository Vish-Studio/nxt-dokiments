import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { mockPhoneViewport } from "@/lib/storybook/mock-phone-viewport";

import { DocumentSavedModal } from "../document-saved-modal";

const meta = {
  title: "Dashboard/Document Saved Modal",
  component: DocumentSavedModal,
  parameters: { layout: "fullscreen" },
  args: {
    documentName: "Lumina Events Invoice",
    onClose: fn(),
    onDone: fn(),
    onDownload: fn(),
    onShare: fn(),
    open: true,
  },
} satisfies Meta<typeof DocumentSavedModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Share (main), Download PDF beside it, and Back to documents underneath. The
 * close X keeps the user in the editor.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const sheet = within(canvasElement.ownerDocument.body).getByRole("dialog", {
      name: "Document saved",
    });
    // Desktop is always a centred modal, never a bottom sheet.
    await expect(sheet).toHaveAttribute("data-layout", "centered");
    await expect(sheet).toHaveAccessibleDescription("Lumina Events Invoice");

    const share = within(sheet).getByRole("button", { name: "Share" });
    await expect(share).toHaveClass("btn-primary");
    await userEvent.click(share);
    await expect(args.onShare).toHaveBeenCalledOnce();

    const download = within(sheet).getByRole("button", {
      name: "Download PDF",
    });
    await expect(download).not.toHaveClass("btn-primary");
    await userEvent.click(download);
    await expect(args.onDownload).toHaveBeenCalledOnce();

    // A filled grey button, so it reads as an action rather than text.
    const back = within(sheet).getByRole("button", {
      name: "Back to documents",
    });
    await expect(back).toHaveClass("bg-base-200");
    await userEvent.click(back);
    await expect(args.onDone).toHaveBeenCalledOnce();

    // Closing keeps the user in the editor instead of going to the list.
    await userEvent.click(within(sheet).getByRole("button", { name: "Close" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

/** Escape does the same as the close X: the user stays in the editor. */
export const EscapeKeepsEditing: Story = {
  play: async ({ args }) => {
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledOnce();
    await expect(args.onDone).not.toHaveBeenCalled();
  },
};

/** On phones the same buttons open in a bottom sheet. */
export const OnPhone: Story = {
  beforeEach: mockPhoneViewport,
  play: async ({ args, canvasElement }) => {
    const sheet = within(canvasElement.ownerDocument.body).getByRole("dialog", {
      name: "Document saved",
    });
    await expect(sheet).toHaveAttribute("data-layout", "sheet");
    await userEvent.click(within(sheet).getByRole("button", { name: "Share" }));
    await expect(args.onShare).toHaveBeenCalledOnce();
    await userEvent.click(within(sheet).getByRole("button", { name: "Close" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

/** With sharing switched off, Download PDF becomes the main button. */
export const WithoutSharing: Story = {
  args: { onShare: undefined },
  play: async ({ canvasElement }) => {
    const sheet = within(canvasElement.ownerDocument.body).getByRole("dialog", {
      name: "Document saved",
    });
    await expect(
      within(sheet).queryByRole("button", { name: "Share" }),
    ).toBeNull();
    await expect(
      within(sheet).getByRole("button", { name: "Download PDF" }),
    ).toHaveClass("btn-primary");
  },
};
