import { AppShell } from "@/components/app-shell/app-shell";
import { MyTemplatesView } from "@/components/my-templates-view/my-templates-view";

const MyTemplatesPage = () => {
  return (
    <AppShell
      activeItem="My Templates"
      description="Organize templates saved to your account."
      pageTitle="My Templates"
      title="My Templates"
    >
      <MyTemplatesView />
    </AppShell>
  );
};

export default MyTemplatesPage;
