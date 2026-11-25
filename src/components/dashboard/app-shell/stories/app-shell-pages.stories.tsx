import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { DocumentsView } from "@/components/dashboard/documents-view/documents-view";
import { MarketplaceBrowser } from "@/components/dashboard/marketplace-browser/marketplace-browser";
import { MyClientsView } from "@/components/dashboard/my-clients-view/my-clients-view";
import { MyTemplatesView } from "@/components/dashboard/my-templates-view/my-templates-view";
import {
  getSampleValues,
  getTemplateById,
  marketplaceTemplates,
  templateStyles,
} from "@/lib/market-place";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import {
  companyStoryDocuments,
  northlineClient,
} from "@/lib/storybook/company-document-fixtures";
import { useAuthStore } from "@/stores/auth-store";
import type { Client } from "@/types/client";
import type { UserDocument } from "@/types/template";

import { AppShell } from "../app-shell";

/**
 * Whole app pages (shell plus page content) with realistic sample data. They
 * cover each page inside the real shell, and `npm run capture:marketing`
 * photographs them for the homepage mockups (`docs/homepage.md`).
 */
const meta = {
  title: "Dashboard/App Shell Pages",
  component: AppShell,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const client = (
  id: string,
  companyName: string,
  name: string,
  email: string,
  phone: string,
  address: string,
): Client => ({
  address,
  brn: "",
  companyName,
  createdAt: 1_755_000_000_000,
  email,
  id,
  name,
  nationalId: "",
  phone,
  updatedAt: 1_755_000_000_000,
});

const clients: Client[] = [
  northlineClient,
  client(
    "client_lumina",
    "Lumina Events",
    "Priya Ramgoolam",
    "hello@luminaevents.mu",
    "+230 5 712 3344",
    "8 Royal Road, Curepipe",
  ),
  client(
    "client_harbour",
    "Harbour Cafe",
    "Jean-Marc Li",
    "accounts@harbour.mu",
    "+230 5 255 0190",
    "Caudan Waterfront, Port Louis",
  ),
  client(
    "client_atlas",
    "Atlas Logistics",
    "Sofia Martin",
    "sofia@atlaslogistics.com",
    "+230 5 900 1122",
    "Business Park, Ebene",
  ),
];

const cvDocument: UserDocument = {
  ...companyStoryDocuments[0],
  id: "cv-1",
  templateId: "classic-cv",
  templateSnapshot: (() => {
    const template = getTemplateById("classic-cv");
    if (!template) throw new Error("classic-cv is missing from the catalog");
    return {
      description: template.description,
      documentType: template.documentType,
      fields: template.fields,
      name: template.name,
      style: template.style,
    };
  })(),
  name: "Financial analyst CV",
  values: { ...getSampleValues("cv"), title: "Financial analyst CV" },
};

/**
 * The June invoice, filled like a real one (items, totals, Northline's contact
 * details), so the editor preview looks finished.
 */
const documents: UserDocument[] = [
  {
    ...companyStoryDocuments[0],
    values: {
      ...getSampleValues("invoice"),
      title: "June retainer invoice",
      toAddress: northlineClient.address,
      toBrn: northlineClient.brn,
      toEmail: northlineClient.email,
      toName: "Northline Studio",
      toPhone: northlineClient.phone,
    },
  },
  ...companyStoryDocuments.slice(1),
  cvDocument,
];

const savedTemplateIds = [
  "classic-invoice",
  "classic-quotation",
  "classic-contract",
  "classic-nda",
  "classic-proposal",
  "classic-cv",
];

/** Signs in a story user and answers every read the pages make. */
const seedWorkspace = () => {
  useAuthStore.setState({
    status: "authenticated",
    user: {
      address: "12 Studio Lane, Port Louis",
      companyName: "Dokiments Studio",
      displayName: "Anthony Alverizko",
      email: "anthony@dokiments.test",
      provider: "password",
      role: "silver",
      uid: "story-user",
    },
  });
  window.fetch = (async (url: string, init?: RequestInit) => {
    if (url.includes("/api/clients")) {
      return new Response(JSON.stringify({ clients }));
    }
    if (url.includes("/api/saved-templates")) {
      return new Response(
        JSON.stringify({
          savedTemplates: savedTemplateIds.map((templateId, index) => ({
            savedAt: Date.UTC(2026, 5, 18 - index),
            template: getTemplateById(templateId),
            templateId,
          })),
        }),
      );
    }
    if (url.includes("/api/templates")) {
      return new Response(
        JSON.stringify({
          styles: templateStyles,
          templates: marketplaceTemplates,
        }),
      );
    }
    if (url.includes("/api/documents/shared")) {
      return new Response(JSON.stringify({ documents: [] }));
    }
    if (url.includes("/api/documents") && (init?.method ?? "GET") === "GET") {
      return new Response(JSON.stringify({ documents }));
    }
    return new Response(JSON.stringify({ error: "Unhandled" }), {
      status: 500,
    });
  }) as typeof window.fetch;
};

export const MarketplacePage: Story = {
  args: {
    activeItem: "Marketplace",
    children: <MarketplaceBrowser />,
    description:
      "Ready-to-use business documents in different styles that will fit your brand. Preview any template, then save the ones you need.",
    title: "Marketplace",
  },
  beforeEach: seedWorkspace,
  play: async ({ canvasElement }) => {
    await expect(
      (await within(canvasElement).findAllByText(/invoice/i)).length,
    ).toBeGreaterThan(0);
  },
};

export const MyDocumentsPage: Story = {
  args: {
    activeItem: "My Documents",
    children: <DocumentsView />,
    description: "Create and manage documents from your saved templates.",
    title: "My Documents",
  },
  beforeEach: seedWorkspace,
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole("tab", { name: /CVs/ }),
    ).toBeVisible();
  },
};

export const MyTemplatesPage: Story = {
  args: { activeItem: "My Templates", title: "My Templates" },
  beforeEach: seedWorkspace,
  render: () => <MyTemplatesView withShell />,
  play: async ({ canvasElement }) => {
    await expect(
      (await within(canvasElement).findAllByText(/quotation/i)).length,
    ).toBeGreaterThan(0);
  },
};

export const MyClientsPage: Story = {
  args: {
    activeItem: "My Clients",
    children: <MyClientsView />,
    description: "Add and manage the clients you prepare documents for.",
    title: "My clients",
  },
  beforeEach: seedWorkspace,
  play: async ({ canvasElement }) => {
    await expect(
      (await within(canvasElement).findAllByText("Harbour Cafe")).length,
    ).toBeGreaterThan(0);
  },
};
