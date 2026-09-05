import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, userEvent, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { useAuthStore } from "@/stores/auth-store";
import type { Client } from "@/types/client";
import type { UserDocument } from "@/types/template";

import { DashboardView } from "../dashboard-view";

/** Mocks `GET /api/saved-templates`, `GET /api/documents` and `GET /api/clients` so
 * `DashboardView`'s queries resolve with fixture data, dispatching on request URL.
 *
 * @param documentsOverride - Replaces the single-document default. Pass `[]` to
 *   reach the "no documents yet, but a template is ready" branch. */
const mockDashboardApi = (documentsOverride?: UserDocument[]) => {
  const contractTemplate = getTemplateById("classic-contract");

  const clients: Client[] = [
    {
      address: "12 Rue La Bourdonnais, Port Louis",
      brn: "",
      companyName: "Northline Studio",
      createdAt: 1_755_000_000_000,
      email: "maya@northline.com",
      id: "client_abc_123456",
      name: "Maya Chen",
      nationalId: "",
      phone: "+230 5 123 4567",
      updatedAt: 1_755_000_000_000,
    },
  ];

  const documents: UserDocument[] = documentsOverride ?? [
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

    if (url.includes("/api/clients")) {
      return new Response(JSON.stringify({ clients }), { status: 200 });
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
          provider: "password",
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
    await expect(await canvas.findByText("1 client")).toBeVisible();
    await expect(await canvas.findByText("Acme Contract")).toBeVisible();

    const newDocumentFab = canvas.getByRole("link", { name: "New document" });
    await expect(newDocumentFab).toBeVisible();
    await expect(newDocumentFab).toHaveAttribute("href", "/my-documents?new=1");
  },
};

/**
 * With no documents but a saved template, the dashboard offers the template
 * directly — and opening its preview must hide the floating action button.
 *
 * The FAB wrapper and the preview's `SidePanel` are both `z-50`, so the later
 * one in DOM order wins: without the guard the FAB would paint over the modal.
 */
export const PreviewHidesActionButton: Story = {
  decorators: [
    (Story) => {
      mockDashboardApi([]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole("link", { name: "New document" }),
    ).toBeVisible();

    await userEvent.click(
      await canvas.findByRole("button", {
        name: "Preview Client Service Agreement, saved",
      }),
    );

    await expect(
      canvas.getByRole("dialog", { name: "Client Service Agreement preview" }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("link", { name: "New document" }),
    ).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      // Overrides the meta-level mock (which runs first) with a request that never resolves.
      window.fetch = (async () =>
        new Promise<Response>(() => {})) as typeof window.fetch;
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("status", { name: /loading workspace snapshot/i }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("status", { name: /loading recent activity/i }),
    ).toBeInTheDocument();
  },
};
