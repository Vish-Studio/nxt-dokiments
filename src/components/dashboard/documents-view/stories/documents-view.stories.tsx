import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";
import { useDocumentsStore } from "@/stores/documents-store";
import { useTemplatesStore } from "@/stores/templates-store";

import { DocumentsView } from "../documents-view";

const seed = () => {
  useAuthStore.setState({
    status: "authenticated",
    user: {
      displayName: "Anthony Alverizko",
      email: "anthony@dokiments.com",
      role: "silver",
      uid: "story-uid",
    },
  });
  useTemplatesStore.setState({
    savedByUser: {
      "story-uid": [
        { savedAt: Date.now(), savedId: "saved-1", templateId: "classic-invoice" },
      ],
    },
  });
};

const meta = {
  title: "Dashboard/Documents View",
  component: DocumentsView,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DocumentsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  decorators: [
    (Story) => {
      seed();
      useDocumentsStore.setState({ documentsByUser: {} });
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no documents yet/i)).toBeVisible();
    await expect(canvas.getAllByRole("button", { name: /new document/i }).length).toBeGreaterThan(0);
  },
};

export const WithDocuments: Story = {
  decorators: [
    (Story) => {
      seed();
      useDocumentsStore.setState({
        documentsByUser: {
          "story-uid": [
            {
              createdAt: Date.now(),
              id: "doc-1",
              name: "March Invoice",
              templateId: "classic-invoice",
              updatedAt: Date.now(),
              values: { invoiceNumber: "INV-0042" },
            },
          ],
        },
      });
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("March Invoice")).toBeVisible();
  },
};
