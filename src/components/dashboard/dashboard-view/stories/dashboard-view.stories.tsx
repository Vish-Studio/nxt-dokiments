import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { useAuthStore } from "@/stores/auth-store";
import type { UserDocument } from "@/types/template";

import { DashboardView } from "../dashboard-view";

/** Mocks `GET /api/saved-templates` and `GET /api/documents` so `DashboardView`'s
 * queries resolve with fixture data, dispatching on request URL. */
const mockDashboardApi = () => {
  const contractTemplate = getTemplateById("classic-contract");

  const documents: UserDocument[] = [
    {
      createdAt: Date.now(),
      id: "doc-1",
      name: "Acme Contract",
      templateId: "classic-contract",
      templateSnapshot: contractTemplate
        ? {
            description: contractTemplate.description,
            documentType: contractTemplate.documentType,
            fields: contractTemplate.fields,
            name: contractTemplate.name,
            style: contractTemplate.style,
          }
        : undefined,
      updatedAt: Date.now(),
      values: {},
    },
  ];

  window.fetch = (async (url: string) => {
    if (url.includes("/api/saved-templates")) {
      return new Response(
        JSON.stringify({
          savedTemplates: [
            {
              savedAt: Date.now(),
              template: contractTemplate,
              templateId: "classic-contract",
            },
          ],
        }),
        { status: 200 },
      );
    }

    return new Response(JSON.stringify({ documents }), { status: 200 });
  }) as typeof window.fetch;
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
      mockDashboardApi();
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
    await expect(
      canvas.getByRole("heading", { name: /welcome back,\s*anthony/i }),
    ).toBeVisible();
    await expect(await canvas.findByText("Saved templates")).toBeVisible();
    await expect(await canvas.findByText("Acme Contract")).toBeVisible();
  },
};
