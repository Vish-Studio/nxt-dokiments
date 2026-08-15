import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, userEvent, within } from "storybook/test";

import { Button } from "@/components/commons/button/button";
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

const storyUser: AuthUser = {
  displayName: "Anthony Alverizko",
  email: "anthony@dokiments.com",
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
