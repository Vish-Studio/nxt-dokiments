import { CheckCircleIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "@/components/commons/button/button";

import { BottomSheet } from "../bottom-sheet";

const meta = {
  title: "Commons/Bottom Sheet",
  component: BottomSheet,
  parameters: { layout: "fullscreen" },
  args: {
    actions: (
      <>
        <Button
          size="sm"
          variant="ghost"
        >
          Not now
        </Button>
        <Button size="sm">Continue</Button>
      </>
    ),
    description: "A short line of supporting copy.",
    onClose: fn(),
    open: true,
    title: "Sheet title",
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Portalled to `document.body`, so queries run against the whole page. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const sheet = page.getByRole("dialog", { name: "Sheet title" });
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAccessibleDescription(
      "A short line of supporting copy.",
    );
    // Focus moves into the sheet when it opens.
    await expect(sheet).toHaveFocus();
  },
};

export const WithIcon: Story = {
  args: {
    icon: (
      <CheckCircleIcon
        aria-hidden
        className="text-success"
        size={24}
        weight="fill"
      />
    ),
    title: "Document saved",
  },
};

/** The close button and Escape both call `onClose`. */
export const Dismiss: Story = {
  play: async ({ args, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const sheet = page.getByRole("dialog", { name: "Sheet title" });
    await userEvent.click(within(sheet).getByRole("button", { name: "Close" }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledTimes(2);
  },
};

/** Without `dismissible`, only the sheet's own actions can close it. */
export const NotDismissible: Story = {
  args: { dismissible: false },
  play: async ({ args, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const sheet = page.getByRole("dialog", { name: "Sheet title" });
    await expect(
      within(sheet).queryByRole("button", { name: "Close" }),
    ).toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};

/** Tab cycles through the sheet's controls and never leaves it. */
export const KeepsFocusInside: Story = {
  args: { dismissible: false },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const sheet = page.getByRole("dialog", { name: "Sheet title" });
    await userEvent.tab();
    await expect(
      within(sheet).getByRole("button", { name: "Not now" }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(
      within(sheet).getByRole("button", { name: "Continue" }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(
      within(sheet).getByRole("button", { name: "Not now" }),
    ).toHaveFocus();
  },
};

/** Shift+Tab straight after opening wraps to the last control, never out of the sheet. */
export const ShiftTabOnOpenStaysInside: Story = {
  args: { dismissible: false },
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const sheet = page.getByRole("dialog", { name: "Sheet title" });
    await expect(sheet).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(
      within(sheet).getByRole("button", { name: "Continue" }),
    ).toHaveFocus();
  },
};
