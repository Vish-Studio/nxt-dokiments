import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, within } from "storybook/test";

import { makeStoryQueryClient } from "@/lib/query/story-query-client";

import { PushNotificationSettings } from "../push-notification-settings";

const meta = {
  component: PushNotificationSettings,
  decorators: [
    (Story) => {
      const [client] = useState(makeStoryQueryClient);

      return (
        <QueryClientProvider client={client}>
          <div className="w-full max-w-xl bg-app-panel p-6">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
  parameters: { layout: "centered" },
  title: "Dashboard/Push Notification Settings",
} satisfies Meta<typeof PushNotificationSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Renders against the real browser the story runs in. Whatever state it detects
 * (off, blocked, or unsupported), the card must never leave the user with a
 * dead control, so it always shows the title and some explanation.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText("Push notifications"),
    ).toBeInTheDocument();
  },
};
