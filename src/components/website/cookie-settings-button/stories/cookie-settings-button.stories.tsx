import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { OPEN_COOKIE_SETTINGS_EVENT } from "@/lib/cookie-consent";

import { CookieSettingsButton } from "../cookie-settings-button";

const meta = {
  title: "Website/Cookie Settings Button",
  component: CookieSettingsButton,
  args: { className: "text-nox-noir" },
} satisfies Meta<typeof CookieSettingsButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const listener = fn();
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, listener, { once: true });
    await userEvent.click(canvas.getByRole("button", { name: "Cookie settings" }));
    await expect(listener).toHaveBeenCalledOnce();
  },
};
