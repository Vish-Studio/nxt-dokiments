import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { CookieConsent } from "@/components/website/cookie-consent/cookie-consent";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  writeCookieConsent,
} from "@/lib/cookie-consent";
import { NEWSLETTER_STATUS_STORAGE_KEY } from "@/lib/newsletter";

import { NewsletterModal } from "../newsletter-modal";

const meta = {
  title: "Website/Newsletter Modal",
  component: NewsletterModal,
  parameters: { layout: "fullscreen" },
  // The modal waits for a cookie decision, which the root layout's banner
  // normally collects. Seed one so the modal is reachable in isolation.
  beforeEach: () => {
    window.localStorage.removeItem(NEWSLETTER_STATUS_STORAGE_KEY);
    writeCookieConsent("necessary");
  },
} satisfies Meta<typeof NewsletterModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstVisit: Story = {
  args: { delayMs: 0 },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("dialog", {
        name: "Make the next document easier.",
      }),
    ).toBeVisible();
  },
};

/** The cookie banner gets the first word; the newsletter follows its answer. */
export const WaitsForCookieConsent: Story = {
  args: { delayMs: 0 },
  beforeEach: () => {
    window.localStorage.removeItem(NEWSLETTER_STATUS_STORAGE_KEY);
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    window.dataLayer = [];
  },
  decorators: [
    (Story, { args }) => (
      <div className="min-h-screen bg-base-200">
        <Story args={args} />
        <CookieConsent />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole("region", { name: "Cookie preferences" }),
    ).toBeVisible();
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Accept all" }));

    await waitFor(async () =>
      expect(
        canvas.queryByRole("region", { name: "Cookie preferences" }),
      ).not.toBeInTheDocument(),
    );
    await expect(
      await canvas.findByRole("dialog", {
        name: "Make the next document easier.",
      }),
    ).toBeVisible();
  },
};
