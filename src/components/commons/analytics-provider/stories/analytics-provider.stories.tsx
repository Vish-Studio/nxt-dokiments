import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "@/components/commons/button/button";
import { trackEvent } from "@/lib/analytics/track";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  writeCookieConsent,
} from "@/lib/cookie-consent";
import { queryKeys } from "@/lib/query/keys";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import type { AuthUser } from "@/types/auth";

import { AnalyticsProvider } from "../analytics-provider";

/** `AnalyticsProvider` calls `useSessionQuery` internally, which requires a
 * `QueryClientProvider` ancestor — and `GET /api/auth/me` isn't running under
 * Storybook, so mock it to a 401 (signed-out) response rather than letting
 * the real fetch fail unpredictably. */
window.fetch = (async () =>
  new Response(null, { status: 401 })) as typeof window.fetch;

const meta = {
  title: "Commons/Analytics Provider",
  component: AnalyticsProvider,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  beforeEach: () => {
    window.dataLayer = [];
    // The pixel's globals and its injected script tag both outlive a single
    // story, so reset them here — otherwise one story's stubbed `fbq` decides
    // whether the next one thinks consent was ever granted.
    delete window.fbq;
    delete window._fbq;
    document
      .querySelectorAll('script[data-meta-pixel-loader="true"]')
      .forEach((script) => script.remove());
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof AnalyticsProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Clicking an element with a serialized `analytics` trigger fires `trackEvent`
 * via the provider's delegated listener — the contract `Button`/`LinkButton`
 * and `PlanCard` all rely on.
 */
export const DelegatedClickIsTracked: Story = {
  args: {
    children: (
      <Button analytics={{ event: "cta_click", params: { placement: "hero" } }}>
        Sign in
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));

    await expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          "event",
          "cta_click",
          expect.objectContaining({ placement: "hero" }),
        ]),
      ]),
    );
  },
};

/**
 * A click on a child of the tracked element (e.g. an icon inside the button)
 * must still resolve to the tracked host via `closest`.
 */
export const ClickOnNestedChildResolvesToHost: Story = {
  args: {
    children: (
      <Button
        analytics={{ event: "cta_click", params: { placement: "hero" } }}
        icon={<span data-testid="nested-icon">→</span>}
      >
        Sign in
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("nested-icon"));

    await expect(window.dataLayer).toEqual(
      expect.arrayContaining([expect.arrayContaining(["event", "cta_click"])]),
    );
  },
};

/**
 * A malformed `data-analytics-params` value must never break the click — the
 * listener drops it silently rather than throwing.
 */
export const MalformedParamsDoNotThrow: Story = {
  args: {
    children: (
      <button
        data-analytics-event="cta_click"
        data-analytics-params="{oops"
        type="button"
      >
        Broken trigger
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Broken trigger" }),
    );

    await expect(window.dataLayer).not.toEqual(
      expect.arrayContaining([expect.arrayContaining(["event"])]),
    );
  },
};

/**
 * The privacy-critical invariant: a visitor who rejects non-essential storage
 * gets no Meta Pixel at all — no `fbevents.js` request, and no `fbq` global.
 *
 * Storybook configures no pixel ID, so `hasMetaPixelConfig` short-circuits the
 * effect before the consent check is even reached. That is deliberate rather
 * than a hole in the test: the assertion has to hold on both paths, and this
 * pins the one that ships if a pixel ID is ever added to the Storybook env.
 */
export const MetaPixelIsNotLoadedWithoutConsent: Story = {
  args: {
    children: <p>Analytics boundary content</p>,
  },
  beforeEach: () => {
    writeCookieConsent("necessary");
  },
  play: async () => {
    await expect(
      document.querySelector('script[data-meta-pixel-loader="true"]'),
    ).toBeNull();
    await expect(window.fbq).toBeUndefined();
  },
};

/**
 * `trackEvent` mirrors a mapped event to the pixel through `trackCustom`,
 * forwarding only the params on that event's allowlist.
 *
 * `document_created` also carries `document_id` and `template_id` in GA4;
 * neither may reach Meta. Stubbing `fbq` stands in for a loaded pixel, which
 * is the only gate `mirrorToMetaPixel` checks — so this covers the forwarding
 * contract without needing a configured pixel ID.
 */
export const MappedEventForwardsOnlyAllowlistedParams: Story = {
  args: {
    children: <p>Analytics boundary content</p>,
  },
  play: async () => {
    const fbq = fn();
    window.fbq = fbq;

    trackEvent("document_created", {
      document_id: "story-document-id",
      document_type: "invoice",
      template_id: "story-template-id",
    });

    await expect(fbq).toHaveBeenCalledWith("trackCustom", "DocumentCreated", {
      document_type: "invoice",
    });
  },
};

/**
 * An event absent from the map is GA-only. This is the default for all but a
 * handful of events, so a regression here would quietly widen what Meta
 * receives across the entire app.
 */
export const UnmappedEventIsNotSentToMetaPixel: Story = {
  args: {
    children: <p>Analytics boundary content</p>,
  },
  play: async () => {
    const fbq = fn();
    window.fbq = fbq;

    trackEvent("cta_click", { placement: "hero" });

    await expect(fbq).not.toHaveBeenCalled();
    // Still reported to GA4 — the mirror is additive, never a replacement.
    await expect(window.dataLayer).toEqual(
      expect.arrayContaining([expect.arrayContaining(["event", "cta_click"])]),
    );
  },
};

const storyUser: AuthUser = {
  displayName: "Anthony Alverizko",
  email: "anthony@dokiments.com",
  provider: "password",
  role: "free",
  uid: "story-user-uid",
};

/**
 * When a signed-in session is already in cache, the provider mirrors the
 * Firebase UID into GA4 via a `config` command with `user_id`. The session
 * is seeded directly into the query cache (rather than mocking `fetch`) so
 * the assertion doesn't race the mount-time fetch that the other stories in
 * this file rely on staying a 401.
 */
export const UserIdIsSetFromSession: Story = {
  decorators: [
    (Story) => {
      const queryClient = makeStoryQueryClient();
      queryClient.setQueryData(queryKeys.session(), storyUser);

      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  args: {
    children: <p>Analytics boundary content</p>,
  },
  play: async () => {
    await expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([
          "config",
          expect.anything(),
          expect.objectContaining({ user_id: "story-user-uid" }),
        ]),
      ]),
    );
  },
};
