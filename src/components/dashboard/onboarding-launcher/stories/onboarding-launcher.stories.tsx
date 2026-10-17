import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, screen, waitFor } from "storybook/test";

import { ONBOARDING_PARAM, ONBOARDING_VALUE } from "@/lib/onboarding/onboarding";
import { useUiStore } from "@/stores/ui-store";

import { OnboardingLauncher } from "../onboarding-launcher";

/** Puts `?welcome=1` on the story iframe's URL, keeping Storybook's own params. */
const arriveFromSignUp = () => {
  const url = new URL(window.location.href);
  url.searchParams.set(ONBOARDING_PARAM, ONBOARDING_VALUE);
  window.history.replaceState(window.history.state, "", url);
};

const meta = {
  title: "Dashboard/Onboarding Launcher",
  component: OnboardingLauncher,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => {
      // The store outlives a story, so each one starts closed.
      useUiStore.setState({ isOnboardingOpen: false });
      return <Story />;
    },
  ],
} satisfies Meta<typeof OnboardingLauncher>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new account lands with `?welcome=1`: the tour opens and the flag is dropped. */
export const AfterSignUp: Story = {
  decorators: [
    (Story) => {
      arriveFromSignUp();
      return <Story />;
    },
  ],
  play: async () => {
    await expect(
      await screen.findByRole("dialog", {
        name: "Welcome to Dokiments",
      }),
    ).toBeVisible();
    await waitFor(() => {
      expect(
        new URLSearchParams(window.location.search).has(ONBOARDING_PARAM),
      ).toBe(false);
    });
  },
};

/** Any other visit: nothing opens until the user asks from the sidebar. */
export const ReturningUser: Story = {
  play: async () => {
    // Longer than the launcher's deferred read, so a wrongly opened tour would show.
    await new Promise((resolve) => window.setTimeout(resolve, 50));
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
