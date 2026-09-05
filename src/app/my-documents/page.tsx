import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { DocumentsView } from "@/components/dashboard/documents-view/documents-view";

const DocumentsPage = () => {
  return (
    <AppShell
      activeItem="My Documents"
      description="Create and manage documents from your saved templates."
      title="My Documents"
    >
      <DocumentsView />
    </AppShell>
  );
};

export default DocumentsPage;
