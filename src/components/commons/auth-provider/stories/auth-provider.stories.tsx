import { QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { makeStoryQueryClient } from "@/lib/query/story-query-client";

import { AuthProvider } from "../auth-provider";

/** `AuthProvider` calls `useSessionQuery` internally, which requires a `QueryClientProvider`
 * ancestor — and `GET /api/auth/me` isn't running under Storybook, so mock it to a 401
 * (signed-out) response rather than letting the real fetch fail unpredictably. */
window.fetch = (async () => new Response(null, { status: 401 })) as typeof window.fetch;

const meta = {
  title: "Commons/Auth Provider",
  component: AuthProvider,
  tags: ["ai-generated"],
  args: {
    children: <p>Auth boundary content</p>,
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof AuthProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Auth boundary content")).toBeVisible();
  },
};
