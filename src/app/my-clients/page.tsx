import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { MyClientsView } from "@/components/dashboard/my-clients-view/my-clients-view";

const MyClientsPage = () => {
  return (
    <AppShell
      activeItem="My Clients"
      description="Add and manage the clients you prepare documents for."
      title="My clients"
    >
      <MyClientsView />
    </AppShell>
  );
};

export default MyClientsPage;
