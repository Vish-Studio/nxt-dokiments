import { CrownIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "@/components/commons/button/button";
import { mockPhoneViewport } from "@/lib/storybook/mock-phone-viewport";

import { Modal } from "../modal";

const meta = {
  title: "Commons/Modal",
  component: Modal,
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
    description: "A short line saying what this is about.",
    onClose: fn(),
    open: true,
    title: "Modal title",
    tone: "info",
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Desktop: a centred modal. Portalled, so queries run against the whole page. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const modal = page.getByRole("dialog", { name: "Modal title" });
    await expect(modal).toHaveAttribute("data-layout", "centered");
    await expect(modal).toHaveAccessibleDescription(
      "A short line saying what this is about.",
    );
    await expect(modal).toHaveFocus();
  },
};

export const Success: Story = {
  args: {
    description: '"Lumina Events Invoice" is saved.',
    title: "Document saved",
    tone: "success",
  },
};

export const Brand: Story = {
  args: {
    description: "Upgrade your account to save more templates.",
    icon: CrownIcon,
    title: "Upgrade to add more templates",
    tone: "brand",
  },
};

/** Phones get a bottom sheet by default. */
export const PhoneSheet: Story = {
  beforeEach: mockPhoneViewport,
  play: async ({ canvasElement }) => {
    const modal = within(canvasElement.ownerDocument.body).getByRole(
      "dialog",
      { name: "Modal title" },
    );
    await expect(modal).toHaveAttribute("data-layout", "sheet");
  },
};

/** `phoneLayout="centered"` keeps decisions in a centred dialog on phones too. */
export const PhoneCentered: Story = {
  args: { phoneLayout: "centered" },
  beforeEach: mockPhoneViewport,
  play: async ({ canvasElement }) => {
    const modal = within(canvasElement.ownerDocument.body).getByRole(
      "dialog",
      { name: "Modal title" },
    );
    await expect(modal).toHaveAttribute("data-layout", "centered");
  },
};

/** The close button and Escape both call `onClose`. */
export const Dismiss: Story = {
  play: async ({ args, canvasElement }) => {
    const modal = within(canvasElement.ownerDocument.body).getByRole(
      "dialog",
      { name: "Modal title" },
    );
    await userEvent.click(within(modal).getByRole("button", { name: "Close" }));
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledTimes(2);
  },
};

/** Without `dismissible`, only the modal's own actions can close it. */
export const NotDismissible: Story = {
  args: { dismissible: false },
  play: async ({ args, canvasElement }) => {
    const modal = within(canvasElement.ownerDocument.body).getByRole(
      "dialog",
      { name: "Modal title" },
    );
    await expect(
      within(modal).queryByRole("button", { name: "Close" }),
    ).toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};

/** Tab and Shift+Tab cycle through the modal's controls and never leave it. */
export const KeepsFocusInside: Story = {
  args: { dismissible: false },
  play: async ({ canvasElement }) => {
    const modal = within(canvasElement.ownerDocument.body).getByRole(
      "dialog",
      { name: "Modal title" },
    );
    // Shift+Tab straight after opening wraps to the last control.
    await userEvent.tab({ shift: true });
    await expect(
      within(modal).getByRole("button", { name: "Continue" }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(
      within(modal).getByRole("button", { name: "Not now" }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(
      within(modal).getByRole("button", { name: "Continue" }),
    ).toHaveFocus();
  },
};
