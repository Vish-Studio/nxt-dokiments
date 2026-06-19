import { AppShell } from "@/components/app-shell/app-shell";
import { DocumentsView } from "@/components/documents-view/documents-view";

const DocumentsPage = () => {
  return (
    <AppShell activeItem="Documents" title="Documents">
      <DocumentsView />
    </AppShell>
  );
};

export default DocumentsPage;
