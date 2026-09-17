import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { queryKeys } from "@/lib/query/keys";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import type { PromoRedemption } from "@/types/promo";

import { PromoCodeCard } from "../promo-code-card";

const REDEEMED: PromoRedemption = {
  code: "ViSHDOK2026!",
  promoId: "launch-2026",
  redeemedAt: Date.parse("2026-08-30T09:00:00.000Z"),
};

type MockOptions = {
  /** What `POST /api/promo-redemptions` answers with. Defaults to a successful redemption. */
  redeem?: { body: unknown; status: number };
  /** What `GET /api/promo-redemptions` returns before anything is redeemed. */
  redemptions?: PromoRedemption[];
  /** Leaves the initial `GET` pending forever, to hold the loading state. */
  stallList?: boolean;
};

/**
 * Mocks both promo endpoints.
 *
 * A successful `POST` also changes what subsequent `GET`s return, so the refetch
 * the mutation triggers `onSettled` agrees with the record just written instead of
 * reverting the card to its entry state.
 */
const mockPromoApi = ({
  redeem = { body: { redemption: REDEEMED }, status: 201 },
  redemptions = [],
  stallList = false,
}: MockOptions = {}) => {
  let current = redemptions;

  window.fetch = (async (url: string, init?: RequestInit) => {
    if (!url.includes("/api/promo-redemptions")) {
      return new Response(
        JSON.stringify({ error: "Unhandled in story mock" }),
        { status: 500 },
      );
    }

    if (init?.method === "POST") {
      if (redeem.status === 201) current = [REDEEMED];
      return new Response(JSON.stringify(redeem.body), {
        status: redeem.status,
      });
    }

    if (stallList) return new Promise<Response>(() => {});

    return new Response(JSON.stringify({ redemptions: current }), {
      status: 200,
    });
  }) as typeof window.fetch;
};

/**
 * Installs the story's API mock and provides one `QueryClient` per mount.
 *
 * Both have to happen exactly once per story run rather than once per render: a
 * client rebuilt mid-story would drop the query cache, and re-running the mock
 * would reset what `GET` returns and undo the record a successful `POST` had just
 * created. `useState`'s initialiser gives us that — it runs before the card's
 * first render and never again for that mount.
 *
 * The cache is also pre-seeded with the story's starting redemptions, so the card
 * renders its final state on the very first commit rather than passing through the
 * skeleton. That keeps each story about one state instead of a transition, and
 * keeps interactions off the commit boundary where a handle can go stale. The
 * `Loading` story opts out, which is the whole point of it.
 */
const StoryShell = ({
  children,
  options,
}: {
  children: ReactNode;
  options?: MockOptions;
}) => {
  const [client] = useState(() => {
    mockPromoApi(options);
    const queryClient = makeStoryQueryClient();

    if (!options?.stallList) {
      queryClient.setQueryData(
        queryKeys.promoRedemptions.all(),
        options?.redemptions ?? [],
      );
    }

    return queryClient;
  });

  return (
    <QueryClientProvider client={client}>
      <div className="w-full max-w-md bg-app-panel p-6">{children}</div>
    </QueryClientProvider>
  );
};

/**
 * Waits for the entry form, types a code and submits it.
 *
 * Elements are re-queried at the point of use rather than held from an earlier
 * `findBy*`, since the card swaps its whole subtree between states and a stale
 * handle would act on a detached node. The value assertion in the middle is a
 * tripwire: without it, a code that failed to land reaches the server as an empty
 * submit and the story fails several lines later on a missing success message,
 * which says nothing about what actually went wrong.
 */
const applyCode = async (
  canvas: ReturnType<typeof within>,
  code: string,
): Promise<void> => {
  await expect(
    await canvas.findByRole("button", { name: /apply promo code/i }),
  ).toBeVisible();

  await userEvent.type(canvas.getByLabelText(/promo code/i), code);
  await expect(canvas.getByLabelText(/promo code/i)).toHaveValue(code);

  await userEvent.click(
    canvas.getByRole("button", { name: /apply promo code/i }),
  );
};

const meta = {
  title: "Dashboard/Promo Code Card",
  component: PromoCodeCard,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof PromoCodeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An account with no redemption — a new sign-up that skipped the field, or any account predating this feature. */
export const NotRedeemed: Story = {
  decorators: [
    (Story) => (
      <StoryShell>
        <Story />
      </StoryShell>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("button", { name: /apply promo code/i }),
    ).toBeVisible();
    await expect(canvas.getByLabelText(/promo code/i)).toBeVisible();
  },
};

/** An account that has already redeemed: status only, with no way to redeem twice. */
export const Redeemed: Story = {
  decorators: [
    (Story) => (
      <StoryShell options={{ redemptions: [REDEEMED] }}>
        <Story />
      </StoryShell>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/has been applied to your account/i),
    ).toBeVisible();
    await expect(canvas.getByText("Applied")).toBeVisible();
    await expect(canvas.getByText(/30 Aug 2026/)).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: /apply promo code/i }),
    ).toBeNull();
  },
};

export const Loading: Story = {
  decorators: [
    (Story) => (
      <StoryShell options={{ stallList: true }}>
        <Story />
      </StoryShell>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("status", { name: /loading your promo code status/i }),
    ).toBeInTheDocument();
  },
};

/** The happy path — and proof that a padded, lower-cased code is accepted. */
export const ApplySucceeds: Story = {
  decorators: [
    (Story) => (
      <StoryShell>
        <Story />
      </StoryShell>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await applyCode(canvas, "  vishdok2026! ");

    await expect(await canvas.findByText(/^Applied$/i)).toBeVisible();
    await expect(
      await canvas.findByText(/has been applied to your account/i),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: /apply promo code/i }),
    ).toBeNull();
  },
};

/**
 * The server refuses a second redemption with a `409`. Reached by submitting from a
 * card that believes the code is unused — which is what a second tab, or a list
 * that went stale, actually looks like.
 */
export const AlreadyRedeemed: Story = {
  decorators: [
    (Story) => (
      <StoryShell
        options={{
          redeem: {
            body: {
              error: "This promo code has already been used for your account.",
            },
            status: 409,
          },
        }}
      >
        <Story />
      </StoryShell>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await applyCode(canvas, "ViSHDOK2026!");

    await expect(
      await canvas.findByText(
        "This promo code has already been used for your account.",
      ),
    ).toBeVisible();
  },
};

/** An unrecognised code shows the server's message, not a client-side guess. */
export const InvalidCode: Story = {
  decorators: [
    (Story) => (
      <StoryShell
        options={{
          redeem: { body: { error: "Invalid promo code." }, status: 400 },
        }}
      >
        <Story />
      </StoryShell>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await applyCode(canvas, "NOTAPROMO");

    await expect(await canvas.findByText("Invalid promo code.")).toBeVisible();
  },
};

/** Submitting an empty field is caught in the browser, with no request made. */
export const RequiresACode: Story = {
  decorators: [
    (Story) => (
      <StoryShell>
        <Story />
      </StoryShell>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole("button", { name: /apply promo code/i }),
    );

    await expect(await canvas.findByText("Enter a promo code.")).toBeVisible();
  },
};
