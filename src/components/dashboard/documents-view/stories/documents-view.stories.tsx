import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

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
              createdAt: new Date("2026-06-18T09:30:00Z").getTime(),
              id: "doc-1",
              name: "March Invoice",
              templateId: "classic-invoice",
              updatedAt: new Date("2026-06-18T09:30:00Z").getTime(),
              values: { invoiceNumber: "INV-0042", title: "Lumina Events Invoice" },
            },
            {
              createdAt: new Date("2026-06-12T11:00:00Z").getTime(),
              id: "doc-2",
              name: "Client Service Agreement",
              templateId: "classic-contract",
              updatedAt: new Date("2026-06-12T11:00:00Z").getTime(),
              values: {},
            },
          ],
        },
      });
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Lumina Events Invoice")).toBeVisible();
    await expect(canvas.getByText("Invoice")).toBeVisible();
    await expect(canvas.getByText("18 Jun 2026")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Open preview for Lumina Events Invoice" }),
    );
    await expect(canvas.getByRole("dialog", { name: "Standard Invoice preview" })).toBeVisible();
  },
};

export const PrintableDocuments: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Print Lumina Events Invoice" }));
    await expect(canvas.getByRole("dialog", { name: "Prepare Lumina Events Invoice" })).toBeVisible();
    await expect(await canvas.findByRole("button", { name: "Download PDF" })).toBeVisible();
  },
};

export const EditDocument: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Edit Lumina Events Invoice" }));
    await expect(canvas.getByRole("heading", { name: "Edit document" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(canvas.getByText("Lumina Events Invoice")).toBeVisible();
  },
};
