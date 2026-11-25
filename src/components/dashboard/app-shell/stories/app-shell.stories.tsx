import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, within } from "storybook/test";

import { CompanyDocumentsView } from "@/components/dashboard/company-documents-view/company-documents-view";
import { DashboardView } from "@/components/dashboard/dashboard-view/dashboard-view";
import { SettingsTabs } from "@/components/dashboard/settings-tabs/settings-tabs";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import {
  companyStoryDocuments,
  companyStorySharedByMe,
  companyStorySharedWithMe,
  northlineClient,
} from "@/lib/storybook/company-document-fixtures";
import { useAuthStore } from "@/stores/auth-store";

import { AppShell } from "../app-shell";

const meta = {
  title: "Dashboard/App Shell",
  component: AppShell,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Signs in a story user so `AuthGuard` renders the shell. */
const seedAuthUser = () => {
  useAuthStore.setState({
    status: "authenticated",
    user: {
      displayName: "Anthony Alverizko",
      email: "anthony@dokiments.test",
      provider: "password",
      role: "free",
      uid: "story-user",
    },
  });
};

export const Default: Story = {
  beforeEach: seedAuthUser,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /collapse sidebar/i })).toBeVisible();
  },
};

/** Settings fills the panel on desktop; only the active section scrolls. */
export const SettingsPage: Story = {
  args: {
    activeItem: "Settings",
    children: <SettingsTabs />,
    title: "Settings",
  },
  beforeEach: Default.beforeEach,
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("tabpanel", { name: "My profile" }),
    ).toBeVisible();
  },
};

/**
 * A sub-page: the top bar shows the company name with a back arrow to
 * "Companies"; the content has no back button of its own.
 */
export const CompanySubPage: Story = {
  args: {
    activeItem: "My Documents",
    back: { href: "/my-documents", label: "Companies" },
    children: <CompanyDocumentsView companyKey="client-client_northline_01" />,
    title: "Company",
  },
  beforeEach: () => {
    seedAuthUser();
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
        return new Response(JSON.stringify({ documents: companyStoryDocuments }));
      }
      return new Response(JSON.stringify({ error: "Unhandled" }), { status: 500 });
    }) as typeof window.fetch;
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      (await canvas.findAllByRole("link", { name: "Back to Companies" })).length,
    ).toBeGreaterThan(0);
    // The top bar takes the company name once the data has loaded.
    await expect(
      (await canvas.findAllByText("Northline Studio")).length,
    ).toBeGreaterThan(1);
    await expect(canvas.queryByText("Back to companies")).toBeNull();
  },
};

/**
 * The dashboard: the standard top bar in the app's black, holding the menu,
 * refresh and notification controls; the welcome card no longer carries them.
 */
export const DashboardHome: Story = {
  args: {
    activeItem: "Dashboard",
    children: <DashboardView />,
    title: "Dashboard",
  },
  beforeEach: () => {
    seedAuthUser();
    window.fetch = (async (url: string) => {
      if (url.includes("/api/clients")) {
        return new Response(JSON.stringify({ clients: [northlineClient] }));
      }
      if (url.includes("/api/saved-templates")) {
        return new Response(JSON.stringify({ savedTemplates: [] }));
      }
      if (url.includes("/api/documents/shared")) {
        return new Response(JSON.stringify({ documents: [] }));
      }
      if (url.includes("/api/documents")) {
        return new Response(JSON.stringify({ documents: companyStoryDocuments }));
      }
      return new Response(JSON.stringify({ error: "Unhandled" }), { status: 500 });
    }) as typeof window.fetch;
  },
  decorators: CompanySubPage.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const banner = canvasElement.querySelector<HTMLElement>(".page-banner");
    await expect(banner).toHaveAttribute("data-variant", "solid");
    await expect(
      within(banner as HTMLElement).getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
    // The welcome card holds only its copy now.
    await expect(
      await canvas.findByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
  },
};
