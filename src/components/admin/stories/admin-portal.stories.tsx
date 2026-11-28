import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { AdminAuditView } from "@/components/admin/admin-audit-view/admin-audit-view";
import { AdminBannerSlideEditor } from "@/components/admin/admin-banner-slide-editor/admin-banner-slide-editor";
import { AdminDocumentsView } from "@/components/admin/admin-documents-view/admin-documents-view";
import { AdminFeedbackView } from "@/components/admin/admin-feedback-view/admin-feedback-view";
import { AdminMarketplaceBannerView } from "@/components/admin/admin-marketplace-banner-view/admin-marketplace-banner-view";
import { AdminNewsletterView } from "@/components/admin/admin-newsletter-view/admin-newsletter-view";
import { AdminNotificationsView } from "@/components/admin/admin-notifications-view/admin-notifications-view";
import { AdminOverviewView } from "@/components/admin/admin-overview-view/admin-overview-view";
import { AdminPlansView } from "@/components/admin/admin-plans-view/admin-plans-view";
import { AdminPromotionsView } from "@/components/admin/admin-promotions-view/admin-promotions-view";
import { AdminSharingDetailView } from "@/components/admin/admin-sharing-detail-view/admin-sharing-detail-view";
import { AdminSharingView } from "@/components/admin/admin-sharing-view/admin-sharing-view";
import { AdminSystemView } from "@/components/admin/admin-system-view/admin-system-view";
import { AdminTemplatesView } from "@/components/admin/admin-templates-view/admin-templates-view";
import { AdminUserDetailView } from "@/components/admin/admin-user-detail-view/admin-user-detail-view";
import { AdminUsersView } from "@/components/admin/admin-users-view/admin-users-view";
import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { listSampleShares } from "@/lib/admin/sharing/dummy-data";
import { marketplaceTemplates } from "@/lib/market-place";
import { templateStyles } from "@/lib/market-place/styles";
import {
  adminStoryAccounts,
  adminStoryFeedback,
  adminStorySubscribers,
  adminStorySystem,
} from "@/lib/storybook/admin-fixtures";
import { useAuthStore } from "@/stores/auth-store";

/** Signs in a superadmin and answers the admin routes with fixtures. */
const seedSuperadmin = () => {
  useAuthStore.setState({
    status: "authenticated",
    user: {
      displayName: "Anthony Alverizko",
      email: "anthony@dokiments.test",
      provider: "password",
      role: "superadmin",
      uid: "u_admin_anthony",
    },
  });
  window.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    const body = url.includes("/api/admin/users/")
      ? {
          user: {
            account: adminStoryAccounts[0],
            feedback: adminStoryFeedback.filter((entry) => entry.uid === adminStoryAccounts[0].uid),
          },
        }
      : url.includes("/api/admin/users")
      ? { accounts: adminStoryAccounts }
      : url.includes("/api/admin/feedback")
        ? { feedback: adminStoryFeedback }
        : url.includes("/api/admin/newsletter")
          ? { subscribers: adminStorySubscribers }
          : url.includes("/api/admin/system")
            ? { system: adminStorySystem }
            : url.includes("/api/templates")
              ? { styles: templateStyles, templates: marketplaceTemplates }
              : { notifications: [] };
    return new Response(JSON.stringify(body));
  }) as typeof window.fetch;
};

const meta = {
  title: "Admin/Portal",
  component: AppShell,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  beforeEach: seedSuperadmin,
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The app for a superadmin: one extra "Admin portal" row above Settings. */
export const AppSidebarForSuperadmin: Story = {
  args: { activeItem: "Dashboard", title: "Dashboard" },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("link", { name: /admin portal/i })).toBeVisible();
  },
};

export const Overview: Story = {
  args: { activeItem: "Overview", area: "admin", children: <AdminOverviewView />, title: "Overview" },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Paid subscribers")).toBeVisible();
    await expect(canvas.getByRole("link", { name: /open app/i })).toBeVisible();
  },
};

export const Users: Story = {
  args: { activeItem: "Users", area: "admin", children: <AdminUsersView />, title: "Users" },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Sofia Brandt")).toBeVisible();
  },
};

export const Feedback: Story = {
  args: { activeItem: "Feedback", area: "admin", children: <AdminFeedbackView />, title: "Feedback" },
};

/** The slides list: the live carousel on top, then slides by status. */
export const MarketplaceBanner: Story = {
  args: { activeItem: "Marketplace banner", area: "admin", children: <AdminMarketplaceBannerView />, title: "Marketplace banner" },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("What customers see on the Marketplace")).toBeVisible();
    await expect(canvas.getAllByRole("link", { name: "Edit" }).length).toBeGreaterThan(0);
  },
};

/** A blank draft: publishing without a title is stopped and explained. */
export const MarketplaceBannerNewSlide: Story = {
  args: {
    activeItem: "Marketplace banner",
    area: "admin",
    back: { href: "/admin/marketplace-banner", label: "Marketplace banner" },
    children: <AdminBannerSlideEditor slideId="new" />,
    title: "New slide",
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole("button", { name: /publish/i }));
    await expect(await canvas.findByText("Add a title.")).toBeVisible();
  },
};

/** Editing a live slide: the preview follows the form, and saving asks first. */
export const MarketplaceBannerEditLiveSlide: Story = {
  args: {
    activeItem: "Marketplace banner",
    area: "admin",
    back: { href: "/admin/marketplace-banner", label: "Marketplace banner" },
    children: <AdminBannerSlideEditor slideId="launch-offer" />,
    title: "Edit slide",
  },
  play: async ({ canvas, userEvent }) => {
    const title = await canvas.findByLabelText(/^Title/);
    await userEvent.clear(title);
    await userEvent.type(title, "Templates for every job");
    await expect(canvas.getAllByText("Templates for every job").length).toBeGreaterThan(0);
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(await within(document.body).findByText("Save changes to this live slide?")).toBeVisible();
  },
};

export const System: Story = {
  args: { activeItem: "System", area: "admin", children: <AdminSystemView />, title: "System" },
};

export const UserDetail: Story = {
  args: {
    activeItem: "Users",
    area: "admin",
    back: { href: "/admin/users", label: "Users" },
    children: <AdminUserDetailView uid={adminStoryAccounts[0].uid} />,
    title: "Account",
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Private to the account")).toBeVisible();
  },
};

export const Plans: Story = {
  args: { activeItem: "Plans", area: "admin", children: <AdminPlansView />, title: "Plans" },
};

export const Templates: Story = {
  args: { activeItem: "Templates", area: "admin", children: <AdminTemplatesView />, title: "Templates" },
};

export const Documents: Story = {
  args: { activeItem: "Documents", area: "admin", children: <AdminDocumentsView />, title: "Documents" },
};

export const Sharing: Story = {
  args: { activeItem: "Sharing", area: "admin", children: <AdminSharingView />, title: "Sharing" },
};

export const SharingDetail: Story = {
  args: {
    activeItem: "Sharing",
    area: "admin",
    back: { href: "/admin/sharing", label: "Sharing" },
    children: <AdminSharingDetailView share={listSampleShares()[0]} />,
    title: "Shared document",
  },
};

export const Newsletter: Story = {
  args: { activeItem: "Newsletter", area: "admin", children: <AdminNewsletterView />, title: "Newsletter" },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("jo@harbour.test")).toBeVisible();
  },
};

export const Promotions: Story = {
  args: { activeItem: "Promotions", area: "admin", children: <AdminPromotionsView />, title: "Promotions" },
};

export const Notifications: Story = {
  args: { activeItem: "Notifications", area: "admin", children: <AdminNotificationsView />, title: "Notifications" },
};

export const AuditLog: Story = {
  args: { activeItem: "Audit log", area: "admin", children: <AdminAuditView />, title: "Audit log" },
};
