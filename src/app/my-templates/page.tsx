import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { MyTemplatesView } from "@/components/dashboard/my-templates-view/my-templates-view";

const MyTemplatesPage = () => {
  return (
    <AppShell
      activeItem="My Templates"
      description="Templates saved to your account."
      title="My Templates"
    >
      <MyTemplatesView />
    </AppShell>
  );
};

export default MyTemplatesPage;
