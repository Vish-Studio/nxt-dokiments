import { QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { useAuthStore } from "@/stores/auth-store";
import { useDocumentsStore } from "@/stores/documents-store";

import { DashboardView } from "../dashboard-view";

/** Mocks `GET /api/saved-templates` so `useSavedTemplatesQuery` resolves with fixture data. */
const mockSavedTemplates = () => {
  window.fetch = (async () =>
    new Response(
      JSON.stringify({
        savedTemplates: [
          {
            savedAt: Date.now(),
            template: getTemplateById("classic-contract"),
            templateId: "classic-contract",
          },
        ],
      }),
      { status: 200 },
    )) as typeof window.fetch;
};

const meta = {
  title: "Dashboard/Dashboard View",
  component: DashboardView,
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
      mockSavedTemplates();
      useDocumentsStore.setState({
        documentsByUser: {
          "story-uid": [
            {
              createdAt: Date.now(),
              id: "doc-1",
              name: "Acme Contract",
              templateId: "classic-contract",
              updatedAt: Date.now(),
              values: {},
            },
          ],
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
} satisfies Meta<typeof DashboardView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /welcome back,\s*anthony/i })).toBeVisible();
    await expect(await canvas.findByText("Saved templates")).toBeVisible();
    await expect(canvas.getByText("Acme Contract")).toBeVisible();
  },
};
