import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import {
  companyStoryDocuments,
  companyStorySharedByMe,
  companyStorySharedWithMe,
  northlineClient,
} from "@/lib/storybook/company-document-fixtures";

import { CompanyDocumentsView } from "../company-documents-view";

/** Answers the documents, shares and clients requests with the fixtures. */
const mockCompanyApi = (documents = companyStoryDocuments) => {
  window.fetch = (async (url: string) => {
    if (url.includes("/api/clients")) {
      return new Response(JSON.stringify({ clients: [northlineClient] }));
    }
    if (url.includes("/api/documents/shared?by=")) {
      return new Response(JSON.stringify({ documents: companyStorySharedByMe }));
    }
    if (url.includes("/api/documents/shared")) {
      return new Response(JSON.stringify({ documents: companyStorySharedWithMe }));
    }
    if (url.includes("/api/documents")) {
      return new Response(JSON.stringify({ documents }));
    }
    return new Response(JSON.stringify({ error: "Unhandled in story mock" }), {
      status: 500,
    });
  }) as typeof window.fetch;
};

const meta = {
  title: "Dashboard/Company Documents View",
  component: CompanyDocumentsView,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => {
      mockCompanyApi();
      return (
        <QueryClientProvider client={makeStoryQueryClient()}>
          <div className="min-h-screen bg-app-panel p-6">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
  args: { companyKey: "client-client_northline_01" },
} satisfies Meta<typeof CompanyDocumentsView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A client-book company: intro, Overview, Client details and the Documents card. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("heading", { name: "Northline Studio" }),
    ).toBeVisible();
    const intro = canvas.getByRole("region", { name: "Northline Studio overview" });
    await expect(
      within(intro).getByRole("link", { name: /new document/i }),
    ).toHaveAttribute("href", "/my-documents?new=1&client=client_northline_01");
    const overview = canvas.getByRole("region", { name: "Overview" });
    await expect(within(overview).getByText("Shared with you")).toBeVisible();

    const history = canvas.getByRole("region", { name: "Documents" });
    await expect(within(history).getByText(/From Alex Morgan/)).toBeVisible();
    await expect(within(history).getAllByRole("listitem")).toHaveLength(5);
    const details = canvas.getByRole("region", { name: "Client details" });
    await expect(within(details).getByText("C09876543")).toBeVisible();
  },
};

/** A company outside the client book: "Add to My Clients" instead. */
export const NotInMyClients: Story = {
  args: { companyKey: "name-lumina-events" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("heading", { name: "Lumina Events" }),
    ).toBeVisible();
    await expect(canvas.getByText(/isn't in My Clients yet/)).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "Add to My Clients" }),
    ).toHaveAttribute("href", "/my-clients");
  },
};

/** An unknown key: a friendly empty state (the top bar has the way back). */
export const UnknownCompany: Story = {
  args: { companyKey: "name-unknown" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("No documents for this company"),
    ).toBeVisible();
  },
};

/** 25 more invoices for Northline, a year of monthly billing and extras. */
const longHistory = [
  ...companyStoryDocuments,
  ...Array.from({ length: 25 }, (_, index) => {
    const base = companyStoryDocuments[0];
    const createdAt = new Date(2026, 3 - Math.floor(index / 2), 28 - (index % 2) * 10, 9, 30).getTime();
    return {
      ...base,
      createdAt,
      id: `nl-long-${index}`,
      name: `Retainer invoice ${index + 1}`,
      updatedAt: createdAt,
      values: { ...base.values, title: `Retainer invoice ${index + 1}` },
    };
  }),
];

/**
 * A long history: the Documents card stays the height of the left column and
 * only its list scrolls (on phones the list is capped instead).
 */
export const LongHistory: Story = {
  decorators: [
    (Story) => {
      mockCompanyApi(longHistory);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = await canvas.findByRole("list", { name: "Company documents" });
    await expect(within(list).getAllByRole("listitem")).toHaveLength(30);
    // The list scrolls inside the card instead of stretching the page.
    await expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  },
};
