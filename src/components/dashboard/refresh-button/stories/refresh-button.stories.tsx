import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { queryKeys } from "@/lib/query/keys";
import { useUiStore } from "@/stores/ui-store";

import { RefreshButton, RefreshButtonView } from "../refresh-button";

const meta = {
  title: "Dashboard/Refresh Button",
  component: RefreshButtonView,
  args: { onRefresh: fn() },
  decorators: [
    (Story) => (
      <div className="flex justify-end bg-golden-harvest p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RefreshButtonView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visual: Story = {};

export const Refreshing: Story = {
  args: { isRefreshing: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Refresh data" }),
    ).toBeDisabled();
  },
};

export const CoolingDown: Story = {
  args: { isCoolingDown: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "Refresh data" }),
    ).toBeDisabled();
  },
};

export const ClickTriggersRefresh: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "Refresh data" }),
    );
    await expect(args.onRefresh).toHaveBeenCalledTimes(1);
  },
};

export const KeyboardActivation: Story = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "Refresh data",
    });

    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onRefresh).toHaveBeenCalledTimes(1);
  },
};

const activeFetcher = fn(async () => "documents");
const inactiveFetcher = fn(async () => "catalog");

const ActiveQuery = () => {
  useQuery({
    queryFn: activeFetcher,
    queryKey: queryKeys.documents.list(),
    staleTime: Infinity,
  });
  return null;
};

const ConnectedHarness = () => {
  const [client] = useState(() => {
    const created = makeStoryQueryClient();
    void created.prefetchQuery({
      queryFn: inactiveFetcher,
      queryKey: queryKeys.clients.all(),
    });
    return created;
  });

  return (
    <QueryClientProvider client={client}>
      <ActiveQuery />
      <RefreshButton />
    </QueryClientProvider>
  );
};

export const ConnectedRefetchesActiveQueriesOnly: Story = {
  render: () => <ConnectedHarness />,
  play: async ({ canvasElement }) => {
    useUiStore.setState({ refreshCooldownUntil: 0 });
    const button = within(canvasElement).getByRole("button", {
      name: "Refresh data",
    });

    await waitFor(() => expect(activeFetcher).toHaveBeenCalled());
    const initialCalls = activeFetcher.mock.calls.length;
    const inactiveCalls = inactiveFetcher.mock.calls.length;

    await userEvent.click(button);
    await waitFor(() =>
      expect(activeFetcher).toHaveBeenCalledTimes(initialCalls + 1),
    );
    await expect(inactiveFetcher.mock.calls.length).toBe(inactiveCalls);
    // The cooldown outlasts the refetch, so further clicks are impossible.
    await waitFor(() => expect(button).toBeDisabled());
    await expect(activeFetcher).toHaveBeenCalledTimes(initialCalls + 1);
  },
};
