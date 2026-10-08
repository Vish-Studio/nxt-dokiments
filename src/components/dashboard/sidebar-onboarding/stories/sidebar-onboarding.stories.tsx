import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, userEvent } from "storybook/test";

import { OnboardingLauncher } from "@/components/dashboard/onboarding-launcher/onboarding-launcher";
import { useUiStore } from "@/stores/ui-store";

import SidebarOnboarding from "../sidebar-onboarding";

const meta = {
  title: "Dashboard/Sidebar Onboarding",
  component: SidebarOnboarding,
  args: { onCloseMobile: fn() },
  decorators: [
    (Story) => {
      useUiStore.setState({ isOnboardingOpen: false });

      // The row only flips the store; the launcher is what renders the tour, as
      // in `AppShell`.
      return (
        <div className="w-60 bg-app-chrome p-5 text-app-chrome-content">
          <Story />
          <OnboardingLauncher />
        </div>
      );
    },
  ],
} satisfies Meta<typeof SidebarOnboarding>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async () => {
    await expect(
      screen.getByRole("button", { name: "Getting started" }),
    ).toBeVisible();
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const OpensTheTour: Story = {
  play: async ({ args }) => {
    await userEvent.click(
      screen.getByRole("button", { name: "Getting started" }),
    );

    await expect(
      await screen.findByRole("dialog", {
        name: "Welcome to Dokiments",
      }),
    ).toBeVisible();
    // Closes the mobile drawer so the tour is not opened behind it.
    await expect(args.onCloseMobile).toHaveBeenCalledOnce();
  },
};

/** Collapsed desktop sidebar: icon only, with the label kept for screen readers. */
export const Collapsed: Story = {
  args: { isCollapsed: true },
};
