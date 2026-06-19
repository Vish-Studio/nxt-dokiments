import { AppShell } from "@/components/app-shell/app-shell";
import { SubscriptionPlans } from "@/components/subscription-plans/subscription-plans";

const SubscriptionPage = () => {
  return (
    <AppShell
      activeItem="Subscription"
      description="Manage your plan and billing."
      pageTitle="Subscription"
      title="Subscription"
    >
      <SubscriptionPlans />
    </AppShell>
  );
};

export default SubscriptionPage;
