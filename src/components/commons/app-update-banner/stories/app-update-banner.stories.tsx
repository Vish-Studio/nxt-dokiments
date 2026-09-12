import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { AppUpdateBannerView } from "../app-update-banner";

const meta = {
  title: "Commons/App Update Banner",
  component: AppUpdateBannerView,
  parameters: { layout: "fullscreen" },
  args: {
    onReload: fn(),
    onDismiss: fn(),
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-base-200">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppUpdateBannerView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visual: Story = {};

export const AnnouncesItselfPolitely: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const banner = canvas.getByRole("region", { name: "Application update" });

    await expect(banner).toBeVisible();
    // Polite, so a screen reader finishes the current utterance first rather than
    // interrupting whatever the user is doing.
    await expect(banner).toHaveAttribute("aria-live", "polite");
  },
};

export const ReloadAsksForTheUpdate: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Reload" }));

    await expect(args.onReload).toHaveBeenCalledOnce();
    await expect(args.onDismiss).not.toHaveBeenCalled();
  },
};

export const NotNowLeavesTheWorkerAlone: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Not now" }));

    // Dismissing must never trigger the reload path: the whole point of the
    // opt-in flow is that declining costs the user nothing.
    await expect(args.onDismiss).toHaveBeenCalledOnce();
    await expect(args.onReload).not.toHaveBeenCalled();
  },
};
