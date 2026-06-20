import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";
import { useDocumentsStore } from "@/stores/documents-store";
import { useTemplatesStore } from "@/stores/templates-store";

import { DashboardView } from "../dashboard-view";

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
      useTemplatesStore.setState({
        savedByUser: {
          "story-uid": [
            { savedAt: Date.now(), savedId: "classic-contract", templateId: "classic-contract" },
          ],
        },
      });
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
        <div className="min-h-screen bg-app-panel p-6">
          <Story />
        </div>
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
    await expect(canvas.getByText("Saved templates")).toBeVisible();
    await expect(canvas.getByText("Acme Contract")).toBeVisible();
  },
};
