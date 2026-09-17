import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { InstallNudgeView } from "../install-nudge";

/** The instructions dialog portals into `document.body`, outside the canvas. */
const document_ = () => within(document.body);

const meta = {
  title: "Commons/Install Nudge",
  component: InstallNudgeView,
  parameters: { layout: "fullscreen" },
  args: {
    guide: "ios",
    mode: "prompt",
    onDismiss: fn(),
    onGuideOpen: fn(),
    onInstall: fn(),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-base-200">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InstallNudgeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visual: Story = {};

/** What an iPhone gets, and the reason the nudge exists at all. */
export const OnIos: Story = {
  args: { guide: "ios", mode: "guide" },
};

export const AnnouncesItselfPolitely: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nudge = canvas.getByRole("region", { name: "Install Dokiments" });

    await expect(nudge).toBeVisible();
    // Polite, so a screen reader finishes the current utterance rather than
    // interrupting whatever the user is doing — this is a convenience, not an alert.
    await expect(nudge).toHaveAttribute("aria-live", "polite");
  },
};

export const InstallAsksTheBrowser: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Install app/ }));

    await expect(args.onInstall).toHaveBeenCalledOnce();
    await expect(args.onDismiss).not.toHaveBeenCalled();
  },
};

export const NotNowCostsTheUserNothing: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Not now" }));

    // Declining must never start an install — the whole basis for showing this
    // unprompted is that saying no is free.
    await expect(args.onDismiss).toHaveBeenCalledOnce();
    await expect(args.onInstall).not.toHaveBeenCalled();
  },
};

export const IosNudgeExplainsTheShareSheet: Story = {
  args: { guide: "ios", mode: "guide" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Install app/ }));

    const dialog = document_().getByRole("dialog", {
      name: "Add Dokiments to your Home Screen",
    });

    await expect(
      within(dialog).getByText(/Add to Home Screen/),
    ).toBeInTheDocument();
    // There is no native prompt to reach for on iOS, so the install path must not
    // be called — the dialog is the whole answer.
    await expect(args.onInstall).not.toHaveBeenCalled();
    await expect(args.onGuideOpen).toHaveBeenCalledOnce();
  },
};
