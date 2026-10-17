import type { Metadata } from "next";

import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { SubscriptionPlans } from "@/components/dashboard/subscription-plans/subscription-plans";
import { privatePageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privatePageMetadata("Subscription");

const SubscriptionPage = () => {
  return (
    <AppShell
      activeItem="Subscription"
      description="Manage your plan and billing."
      title="Subscription"
    >
      <SubscriptionPlans />
    </AppShell>
  );
};

export default SubscriptionPage;
