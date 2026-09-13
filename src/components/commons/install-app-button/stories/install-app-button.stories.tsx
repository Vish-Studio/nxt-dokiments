import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { InstallAppButtonView } from "../install-app-button";

/**
 * The dialog renders through a portal into `document.body`, so it is deliberately
 * outside `canvasElement` and has to be queried from the document instead.
 */
const document_ = () => within(document.body);

const meta = {
  title: "Commons/Install App Button",
  component: InstallAppButtonView,
  args: {
    guide: "ios",
    mode: "prompt",
    onGuideOpen: fn(),
    onInstall: fn(),
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-40 items-center justify-center bg-base-200 p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InstallAppButtonView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visual: Story = {};

/** The footer's exact configuration, which is the dark surface it ships on. */
export const OnDarkSurface: Story = {
  args: {
    className:
      "border border-white/25 text-white hover:bg-white/10 hover:text-white",
    variant: "ghost",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-40 items-center justify-center bg-nox-noir p-8">
        <Story />
      </div>
    ),
  ],
};

export const PromptModeAsksTheBrowser: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Install app/ }));

    await expect(args.onInstall).toHaveBeenCalledOnce();
    // The browser owns the dialog in this mode, so ours must stay shut — two
    // stacked install dialogs would be nonsense.
    await expect(args.onGuideOpen).not.toHaveBeenCalled();
    await expect(document_().queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const GuideModeExplainsTheIosPath: Story = {
  args: { guide: "ios", mode: "guide" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Install app/ }));

    const dialog = document_().getByRole("dialog", {
      name: "Add Dokiments to your Home Screen",
    });

    await expect(dialog).toBeVisible();
    await expect(
      within(dialog).getByText(/Add to Home Screen/),
    ).toBeInTheDocument();
    // Nothing native to open here, so the prompt path must not be touched.
    await expect(args.onInstall).not.toHaveBeenCalled();
    await expect(args.onGuideOpen).toHaveBeenCalledOnce();
  },
};

export const GuideModeExplainsTheSafariDockPath: Story = {
  args: { guide: "safari-desktop", mode: "guide" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Install app/ }));

    const dialog = document_().getByRole("dialog", {
      name: "Add Dokiments to your Dock",
    });

    await expect(within(dialog).getByText(/Add to Dock/)).toBeInTheDocument();
  },
};

export const GuideEscapesTheCanvasToCoverTheViewport: Story = {
  args: { guide: "browser-menu", mode: "guide" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Install app/ }));

    // The portal is load-bearing, not tidiness. This button is meant to drop into
    // any surface, and the footer it ships in sits inside a transformed,
    // overflow-hidden column — which would become the containing block for a
    // `position: fixed` backdrop and clip the panel. Rendering into `document.body`
    // is what keeps it a real modal wherever the button is mounted.
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await expect(document_().getByRole("dialog")).toBeVisible();
  },
};

export const GuideRoutesAnInAppBrowserOutToSafari: Story = {
  args: { guide: "ios-in-app-browser", mode: "guide" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Install app/ }));

    const dialog = document_().getByRole("dialog", {
      name: "Open Dokiments in Safari to install",
    });

    // The extra first step is the point: an in-app webview has no share sheet, so
    // the plain iOS wording would send the user hunting for a Share button that is
    // not there.
    await expect(
      within(dialog).getByText(/Open in Safari/),
    ).toBeInTheDocument();
    await expect(
      within(dialog).getByText(/In Safari, tap Share/),
    ).toBeInTheDocument();
  },
};

export const GuideCanBeDismissed: Story = {
  args: { guide: "browser-menu", mode: "guide" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Install app/ }));
    await expect(document_().getByRole("dialog")).toBeVisible();

    await userEvent.click(document_().getByRole("button", { name: "Got it" }));

    // Instructions are reference material, not a decision — closing them must
    // leave the button behind so the user can read them again.
    await expect(document_().queryByRole("dialog")).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: /Install app/ }),
    ).toBeVisible();
  },
};
