import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, fn, screen, userEvent } from "storybook/test";

import { makeStoryQueryClient } from "@/lib/query/story-query-client";

import SidebarFeedback from "../sidebar-feedback";

const meta = {
  title: "Dashboard/Sidebar Feedback",
  component: SidebarFeedback,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        {/* The sidebar's own dark chrome, so the row's contrast is judged in the
            surface it actually sits on rather than on white. */}
        <div className="w-60 bg-app-chrome p-5 text-app-chrome-content">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof SidebarFeedback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async () => {
    await expect(
      screen.getByRole("button", { name: /send feedback/i }),
    ).toBeVisible();
    // Closed until asked for.
    await expect(
      screen.queryByRole("heading", { name: /share your thoughts/i }),
    ).toBeNull();
  },
};

export const OpensTheDialog: Story = {
  play: async () => {
    await userEvent.click(screen.getByRole("button", { name: /send feedback/i }));

    await expect(
      await screen.findByRole("heading", { name: /share your thoughts/i }),
    ).toBeVisible();
  },
};

/**
 * Collapsed sidebar. The label becomes screen-reader-only at `lg`, so the row is
 * still reachable by its accessible name even though only the icon is painted.
 */
export const Collapsed: Story = {
  args: { isCollapsed: true },
  play: async () => {
    await expect(
      screen.getByRole("button", { name: /send feedback/i }),
    ).toBeVisible();
  },
};

/**
 * On mobile the drawer has to close as the dialog opens, or the dialog would
 * appear behind it.
 */
export const ClosesTheMobileDrawer: Story = {
  args: { onCloseMobile: fn() },
  play: async ({ args }) => {
    await userEvent.click(screen.getByRole("button", { name: /send feedback/i }));

    await expect(args.onCloseMobile).toHaveBeenCalled();
    await expect(
      await screen.findByRole("heading", { name: /share your thoughts/i }),
    ).toBeVisible();
  },
};
