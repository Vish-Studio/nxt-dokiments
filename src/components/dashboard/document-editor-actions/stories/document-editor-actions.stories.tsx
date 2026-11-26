import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";

import { mockPhoneViewport } from "@/lib/storybook/mock-phone-viewport";

import { DocumentEditorActions } from "../document-editor-actions";

const meta = {
  title: "Dashboard/Document Editor Actions",
  component: DocumentEditorActions,
  args: {
    onDownload: fn(),
    onPreview: fn(),
    onSave: fn(),
    onShare: fn(),
    saveLabel: "Save changes",
  },
  decorators: [
    (Story) => (
      // A short scrolling page, so the bar is seen floating over the form.
      <div className="h-80 overflow-y-auto bg-app-panel p-4">
        <div className="grid gap-3 rounded-box border border-steel-mist bg-base-100 p-6">
          {Array.from({ length: 12 }, (_, index) => (
            <div
              className="h-10 rounded-field bg-base-200"
              key={index}
            />
          ))}
        </div>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DocumentEditorActions>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Editing a saved document: a dark pill with Download PDF, Share and Save,
 * floating at the bottom centre while the form scrolls. (Preview shows below
 * `lg`.) Delete is not here; it lives in the document's row menu.
 */
export const EditDocument: Story = {
  play: async ({ args, canvas }) => {
    const save = canvas.getByRole("button", { name: "Save changes" });
    // Pinned: visible without scrolling past the twelve form rows.
    await expect(save).toBeVisible();
    await expect(
      getComputedStyle(save.closest(".document-editor-actions")!).position,
    ).toBe("sticky");

    await userEvent.click(save);
    await expect(args.onSave).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Share" }));
    await expect(args.onShare).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Download PDF" }));
    await expect(args.onDownload).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole("button", { name: /Delete/ })).toBeNull();
    await expect(
      canvas.getByRole("toolbar", { name: "Document actions" }),
    ).toBeVisible();
  },
};

/** A new document: no Share until it is saved; Download PDF works on the draft. */
export const NewDocument: Story = {
  args: {
    onShare: undefined,
    saveLabel: "Create document",
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Create document" }),
    ).toBeVisible();
    await expect(canvas.queryByRole("button", { name: "Share" })).toBeNull();
    await expect(
      canvas.getByRole("button", { name: "Download PDF" }),
    ).toBeInTheDocument();
  },
};

/** While creating, Save is disabled and says what is happening. */
export const Creating: Story = {
  args: {
    onShare: undefined,
    saveDisabled: true,
    saveLabel: "Creating…",
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Creating…" }),
    ).toBeDisabled();
  },
};

/** Phones: the eye opens the preview, which sits beside the form on desktop. */
export const OnPhone: Story = {
  beforeEach: mockPhoneViewport,
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: async ({ args, canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Preview" }));
    await expect(args.onPreview).toHaveBeenCalledOnce();
    await expect(
      canvas.getByRole("button", { name: "Save changes" }),
    ).toBeVisible();
  },
};
