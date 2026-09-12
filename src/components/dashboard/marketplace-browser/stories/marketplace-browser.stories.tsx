import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, waitFor, within } from "storybook/test";

import {
  getTemplateById,
  marketplaceTemplates,
  templateStyles,
} from "@/lib/market-place";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { useAuthStore } from "@/stores/auth-store";

import { MarketplaceBrowser } from "../marketplace-browser";

/**
 * Mocks both `GET /api/templates` (the catalog `useTemplatesQuery` reads) and
 * `GET /api/saved-templates` (`useSavedTemplatesQuery`), dispatching on the
 * request URL/method since `MarketplaceBrowser` calls both. `POST` (save)
 * resolves with a generic success body — none of these stories assert on it.
 */
const mockCatalog = (
  savedTemplates: Array<{ savedAt: number; templateId: string }>,
) => {
  window.fetch = (async (url: string, init?: RequestInit) => {
    if (url.includes("/api/saved-templates")) {
      if (init?.method === "POST") {
        return new Response(
          JSON.stringify({ savedAt: Date.now(), templateId: "" }),
          { status: 201 },
        );
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
    }

    return new Response(
      JSON.stringify({
        styles: templateStyles,
        templates: marketplaceTemplates,
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
          provider: "password",
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
    mockCatalog([]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("heading", { name: /invoice/i }),
    ).toBeVisible();
    await expect(
      canvas.getAllByRole("button", { name: /preview/i }).length,
    ).toBeGreaterThan(0);
  },
};

export const SavedTemplatesFirst: Story = {
  beforeEach: () => {
    window.history.replaceState(null, "", "/");
    mockCatalog([{ savedAt: Date.now(), templateId: "classic-invoice" }]);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("button", { name: /saved/i }),
    ).toBeVisible();
  },
};

/** Mocks a catalog request that never resolves so `isCatalogLoading` stays `true` and the skeleton renders. */
const mockCatalogLoading = () => {
  window.fetch = (async () =>
    new Promise<Response>(() => {})) as typeof window.fetch;
};

export const Loading: Story = {
  beforeEach: () => {
    window.history.replaceState(null, "", "/");
    mockCatalogLoading();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("status", { name: /loading marketplace templates/i }),
    ).toBeInTheDocument();
  },
};

export const PendingTemplateConfirmation: Story = {
  beforeEach: () => {
    mockCatalog([]);
    window.history.replaceState(
      null,
      "",
      "/marketplace?template=classic-invoice",
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(async () => {
      await expect(
        canvas.getByRole("dialog", { name: /add to my templates/i }),
      ).toBeVisible();
    });
    await expect(
      canvas.getByRole("button", { name: /browse later/i }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /add template/i }),
    ).toBeVisible();
  },
};
