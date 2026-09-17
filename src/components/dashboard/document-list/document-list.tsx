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

/** Exported so the loading skeleton renders the same header and column widths. */
export const documentListColumns: DashboardListColumn[] = [
  { className: "col-span-5", label: "Title" },
  { className: "col-span-2", label: "Type" },
  { className: "col-span-3", label: "Date created" },
  { className: "col-span-2 text-right", label: "Actions" },
];

/**
 * Shimmer cells for one `DocumentListItem`, kept beside `documentListColumns` so
 * the two stay in step. Passed to `DashboardListSkeleton`, which supplies the row.
 */
export const documentSkeletonRow = (
  <>
    <div className="flex min-w-0 items-center gap-3 sm:col-span-5">
      <div className="skeleton size-10 shrink-0 rounded-field" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="skeleton h-4 w-2/3 rounded-field" />
        <div className="skeleton h-3 w-1/2 rounded-field" />
      </div>
    </div>

    <div className="sm:col-span-2">
      <div className="skeleton h-6 w-20 rounded-field" />
    </div>

    <div className="sm:col-span-3">
      <div className="skeleton h-4 w-24 rounded-field" />
    </div>

    <div className="flex justify-end gap-2 sm:col-span-2">
      <div className="skeleton size-10 rounded-field" />
      <div className="skeleton size-10 rounded-field" />
    </div>
  </>
);

export const DocumentList = ({
  documents,
  onEdit,
  onPreview,
  onPrint,
}: DocumentListProps) => {
  return (
    <DashboardList
      columns={documentListColumns}
      ordered
    >
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
