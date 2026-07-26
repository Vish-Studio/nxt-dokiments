import { QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { useAuthStore } from "@/stores/auth-store";

import { MarketplaceBrowser } from "../marketplace-browser";

/** Mocks `GET /api/saved-templates` so `useSavedTemplatesQuery` resolves with fixture data.
 * `POST` (save) resolves with a generic success body — none of these stories assert on it. */
const mockSavedTemplates = (savedTemplates: Array<{ savedAt: number; templateId: string }>) => {
  window.fetch = (async (_url: string, init?: RequestInit) => {
    if (init?.method === "POST") {
      return new Response(JSON.stringify({ savedAt: Date.now(), templateId: "" }), { status: 201 });
    }
    return new Response(
      JSON.stringify({
        savedTemplates: savedTemplates.map((item) => ({
          ...item,
          template: getTemplateById(item.templateId),
        })),
      }),
      { status: 200 },
    );
  }) as typeof window.fetch;
};

const meta = {
  title: "Dashboard/Marketplace Browser",
  component: MarketplaceBrowser,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => {
      useAuthStore.setState({
        status: "authenticated",
        user: {
          displayName: "Anthony Alverizko",
          email: "anthony@dokiments.com",
          role: "free",
          uid: "story-uid",
        },
      });
      return (
        <QueryClientProvider client={makeStoryQueryClient()}>
          <div className="min-h-screen bg-app-panel p-6">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof MarketplaceBrowser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FreeUser: Story = {
  beforeEach: () => {
    window.history.replaceState(null, "", "/");
    mockSavedTemplates([]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /classic/i })).toBeVisible();
    await expect(canvas.getAllByRole("button", { name: /preview/i }).length).toBeGreaterThan(0);
  },
};

export const SavedTemplatesFirst: Story = {
  beforeEach: () => {
    window.history.replaceState(null, "", "/");
    mockSavedTemplates([{ savedAt: Date.now(), templateId: "classic-invoice" }]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("button", { name: /saved/i })).toBeVisible();
  },
};

export const PendingTemplateConfirmation: Story = {
  beforeEach: () => {
    mockSavedTemplates([]);
    window.history.replaceState(null, "", "/marketplace?template=classic-invoice");
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await expect(canvas.getByRole("dialog", { name: /add to my templates/i })).toBeVisible();
    });
    await expect(canvas.getByRole("button", { name: /browse later/i })).toBeVisible();
    await expect(canvas.getByRole("button", { name: /add template/i })).toBeVisible();
  },
};
