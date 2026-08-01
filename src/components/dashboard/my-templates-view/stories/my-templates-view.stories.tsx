import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { useAuthStore } from "@/stores/auth-store";

import { MyTemplatesView } from "../my-templates-view";

const seedUser = () => {
  useAuthStore.setState({
    status: "authenticated",
    user: {
      displayName: "Anthony Alverizko",
      email: "anthony@dokiments.com",
      role: "silver",
      uid: "story-uid",
    },
  });
};

/** Mocks `GET /api/saved-templates` so `useSavedTemplatesQuery` resolves with fixture data. */
const mockSavedTemplates = (
  savedTemplates: Array<{ savedAt: number; templateId: string }>,
) => {
  window.fetch = (async () =>
    new Response(
      JSON.stringify({
        savedTemplates: savedTemplates.map((item) => ({
          ...item,
          template: getTemplateById(item.templateId),
        })),
      }),
      { status: 200 },
    )) as typeof window.fetch;
};

const meta = {
  title: "Dashboard/My Templates View",
  component: MyTemplatesView,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <div className="min-h-screen bg-app-panel p-6">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof MyTemplatesView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockSavedTemplates([]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(/no templates yet/i)).toBeVisible();
  },
};

/** Mocks a saved-templates request that never resolves so `isLoading` stays `true` and the skeleton renders. */
const mockSavedTemplatesLoading = () => {
  window.fetch = (async () =>
    new Promise<Response>(() => {})) as typeof window.fetch;
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockSavedTemplatesLoading();
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("status", { name: /loading your templates/i }),
    ).toBeInTheDocument();
  },
};

export const WithTemplates: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockSavedTemplates([
        { savedAt: Date.now(), templateId: "modern-contract" },
      ]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("button", {
        name: /preview client service agreement/i,
      }),
    ).toBeVisible();
  },
};
