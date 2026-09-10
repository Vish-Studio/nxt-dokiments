import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, userEvent, within } from "storybook/test";

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
      provider: "password",
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
      (await canvas.findAllByRole("button", {
        name: /preview client service agreement/i,
      }))[0],
    ).toBeVisible();
  },
};

export const GroupedGallery: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockSavedTemplates([
        { savedAt: 1000, templateId: "classic-invoice" },
        { savedAt: 2000, templateId: "modern-invoice" },
        { savedAt: 3000, templateId: "minimalist-invoice" },
        { savedAt: 4000, templateId: "classic-quotation" },
        { savedAt: 5000, templateId: "modern-quotation" },
      ]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const invoices = await canvas.findByRole("region", { name: "Standard Invoice" });
    const quotations = await canvas.findByRole("region", { name: "Price Quotation" });
    await expect(within(invoices).getAllByRole("button")).toHaveLength(3);
    await expect(within(quotations).getAllByRole("button")).toHaveLength(2);
  },
};

export const FilterSortAndRecent: Story = {
  ...GroupedGallery,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const recent = await canvas.findByRole("region", { name: "Recently Added" });
    const recentCards = within(recent).getAllByRole("button");
    await expect(recentCards).toHaveLength(4);
    await expect(recentCards[0]).toHaveTextContent("Modern");
    await expect(recentCards[0]).toHaveAccessibleName(/Price Quotation/);
    await expect(recentCards[3]).toHaveTextContent("Modern");
    await expect(recentCards[3]).toHaveAccessibleName(/Standard Invoice/);
    await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
    await userEvent.click(canvas.getByRole("menuitemradio", { name: "Standard Invoice" }));
    await expect(canvas.queryByRole("region", { name: "Price Quotation" })).not.toBeInTheDocument();
    await expect(within(canvas.getByRole("region", { name: "Standard Invoice" })).getByText("3")).toBeVisible();
    const invoices = canvas.getByRole("region", { name: "Standard Invoice" });
    await userEvent.click(canvas.getByRole("button", { name: "Sort" }));
    await userEvent.click(canvas.getByRole("menuitemradio", { name: "Oldest added" }));
    await expect(within(invoices).getAllByRole("button")[0]).toHaveTextContent("Classic designs");
    await userEvent.click(canvas.getByRole("button", { name: "Sort" }));
    await userEvent.click(canvas.getByRole("menuitemradio", { name: "Recently added" }));
    await expect(within(invoices).getAllByRole("button")[0]).toHaveTextContent("Minimalist designs");
    await userEvent.click(canvas.getByRole("button", { name: "Filters" }));
    await userEvent.click(canvas.getByRole("menuitemradio", { name: "Modern" }));
    await expect(within(invoices).getByText("1")).toBeVisible();
    await userEvent.type(canvas.getByLabelText("Search templates"), "no match");
    await expect(canvas.getByText(/No matching templates/)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Reset filters" }));
    await expect(within(canvas.getByRole("region", { name: "Recently Added" })).getByText("4")).toBeVisible();
    await expect(within(canvas.getByRole("region", { name: "Recently Added" })).getAllByRole("button")).toHaveLength(4);
  },
};

export const PageToolbar: Story = {
  ...GroupedGallery,
  args: { withShell: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole("heading", { name: "My Templates", level: 2 }).closest("section")!;
    await canvas.findByRole("region", { name: "Recently Added" });
    const search = canvas.getByRole("searchbox", { name: "Search templates" });
    await expect(header.contains(search)).toBe(false);
    await expect(header).toHaveClass("bg-play-pink");
    await expect(search).toBeVisible();
    await canvas.findByRole("region", { name: "Recently Added" });
    await userEvent.type(search, "no match");
    await expect(canvas.getByText(/No matching templates/)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Reset filters" }));
    await expect(canvas.getByRole("region", { name: "Recently Added" })).toBeVisible();
  },
};
