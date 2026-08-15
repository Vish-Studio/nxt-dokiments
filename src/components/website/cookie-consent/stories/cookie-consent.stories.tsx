import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { COOKIE_CONSENT_STORAGE_KEY } from "@/lib/cookie-consent";

import { CookieConsent } from "../cookie-consent";

const meta = {
  title: "Website/Cookie Consent",
  component: CookieConsent,
  parameters: { layout: "fullscreen" },
  beforeEach: () => {
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    window.dataLayer = [];
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-base-200">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CookieConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visual: Story = {};

export const FirstVisit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("region", { name: "Cookie preferences" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Reject non-essential" }),
    );
    await expect(
      canvas.queryByRole("region", { name: "Cookie preferences" }),
    ).not.toBeInTheDocument();
    await expect(
      window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY),
    ).toContain("necessary");
    await expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          "consent",
          "update",
          expect.objectContaining({ analytics_storage: "denied" }),
        ]),
      ]),
    );
  },
};

export const AcceptAllGrantsConsent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Accept all" }));
    await expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          "consent",
          "update",
          expect.objectContaining({ analytics_storage: "granted" }),
        ]),
      ]),
    );
  },
};
