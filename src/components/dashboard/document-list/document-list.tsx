import {
  DashboardList,
  type DashboardListColumn,
} from "@/components/dashboard/dashboard-list/dashboard-list";
import { DocumentListItem } from "@/components/dashboard/document-list-item/document-list-item";
import type { UserDocument } from "@/types/template";

export interface DocumentListProps {
  documents: UserDocument[];
  onEdit: (document: UserDocument) => void;
  onPreview: (document: UserDocument) => void;
  onPrint: (document: UserDocument) => void;
}

const columns: DashboardListColumn[] = [
  { className: "col-span-5", label: "Title" },
  { className: "col-span-2", label: "Type" },
  { className: "col-span-3", label: "Date created" },
  { className: "col-span-2 text-right", label: "Actions" },
];

export const DocumentList = ({ documents, onEdit, onPreview, onPrint }: DocumentListProps) => {
  return (
    <DashboardList columns={columns} ordered>
      {documents.map((document) => (
        <DocumentListItem
          document={document}
          key={document.id}
          onEdit={onEdit}
          onPreview={onPreview}
          onPrint={onPrint}
        />
      ))}
    </DashboardList>
  );
};
