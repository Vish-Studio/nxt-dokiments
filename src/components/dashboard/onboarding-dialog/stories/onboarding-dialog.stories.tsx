import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, userEvent } from "storybook/test";

import { OnboardingDialog } from "../onboarding-dialog";

const meta = {
  title: "Dashboard/Onboarding Dialog",
  component: OnboardingDialog,
  args: {
    onClose: fn(),
    open: true,
    userName: "Anthony Alverizko",
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof OnboardingDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Rendered into `document.body`, so queries use `screen` rather than the canvas. */
export const Welcome: Story = {
  play: async ({ args }) => {
    await expect(
      screen.getByRole("dialog", { name: "Welcome to Dokiments" }),
    ).toBeVisible();
    // Greets by first name only.
    await expect(screen.getByText(/^Hi Anthony! Dokiments helps you/)).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Show me around" }));
    await expect(
      screen.getByRole("dialog", { name: "Find templates in the Marketplace" }),
    ).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await expect(
      screen.getByRole("dialog", { name: "Your saved templates" }),
    ).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    await expect(
      screen.getByRole("dialog", { name: "Welcome to Dokiments" }),
    ).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Skip" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

/** Without a name the welcome copy simply drops the greeting. */
export const WelcomeWithoutName: Story = {
  args: { userName: undefined },
  play: async () => {
    await expect(screen.getByText(/^Dokiments helps you/)).toBeVisible();
  },
};

export const LastStep: Story = {
  args: { initialStep: 5 },
  play: async ({ args }) => {
    await expect(
      screen.getByRole("dialog", { name: "Free to start" }),
    ).toBeVisible();

    const finish = screen.getByRole("button", { name: "Get started" });
    // The finish uses the golden accent rather than the black primary.
    await expect(finish).toHaveClass("bg-golden-harvest");
    await userEvent.click(finish);
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const ClosesOnEscape: Story = {
  play: async ({ args }) => {
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};

/**
 * Full width and height below `md`: the close button in its own row, then the
 * image container, with the actions pinned to the bottom.
 */
export const Mobile: Story = {
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
};

export const Closed: Story = {
  args: { open: false },
  play: async () => {
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
