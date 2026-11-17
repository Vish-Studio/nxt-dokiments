import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { DocumentSavedSheet } from "../document-saved-sheet";

const meta = {
  title: "Dashboard/Document Saved Sheet",
  component: DocumentSavedSheet,
  parameters: { layout: "fullscreen" },
  args: {
    documentName: "Lumina Events Invoice",
    onClose: fn(),
    onDone: fn(),
    onDownload: fn(),
    onShare: fn(),
    open: true,
  },
} satisfies Meta<typeof DocumentSavedSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Share is the main action, Download PDF the alternative, Done goes back to the list. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const sheet = within(canvasElement.ownerDocument.body).getByRole(
      "dialog",
      { name: "Document saved" },
    );
    await expect(sheet).toHaveAccessibleDescription(
      '"Lumina Events Invoice" is saved. What would you like to do next?',
    );

    await userEvent.click(within(sheet).getByRole("button", { name: "Share" }));
    await expect(args.onShare).toHaveBeenCalledOnce();
    await userEvent.click(
      within(sheet).getByRole("button", { name: "Download PDF" }),
    );
    await expect(args.onDownload).toHaveBeenCalledOnce();
    await userEvent.click(within(sheet).getByRole("button", { name: "Done" }));
    await expect(args.onDone).toHaveBeenCalledOnce();

    // Dismissing keeps the user in the editor instead of going to the list.
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

/** With sharing switched off, Download PDF becomes the main action. */
export const WithoutSharing: Story = {
  args: { onShare: undefined },
  play: async ({ canvasElement }) => {
    const sheet = within(canvasElement.ownerDocument.body).getByRole(
      "dialog",
      { name: "Document saved" },
    );
    await expect(
      within(sheet).queryByRole("button", { name: "Share" }),
    ).toBeNull();
    await expect(
      within(sheet).getByRole("button", { name: "Download PDF" }),
    ).toHaveClass("btn-primary");
  },
};
