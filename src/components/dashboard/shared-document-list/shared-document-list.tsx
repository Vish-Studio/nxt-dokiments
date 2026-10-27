import {
  DashboardList,
  type DashboardListColumn,
} from "@/components/dashboard/dashboard-list/dashboard-list";
import { SharedDocumentListItem } from "@/components/dashboard/shared-document-list-item/shared-document-list-item";
import { recipientStatusFor } from "@/lib/sharing/recipient-status";
import type { SharedDocument } from "@/types/sharing";

export interface SharedDocumentListProps {
  documents: SharedDocument[];
  /** Called when a row is activated, to open the read-only preview. */
  onOpen: (document: SharedDocument) => void;
  /** The signed-in user's address, used to pick their own status from each share. */
  userEmail: string | undefined;
}

/** Exported so a loading skeleton can render the same header and column widths. */
export const sharedDocumentListColumns: DashboardListColumn[] = [
  { className: "col-span-5", label: "Title" },
  { className: "col-span-3", label: "Shared by" },
  { className: "col-span-2", label: "Shared on" },
  { className: "col-span-2 text-right", label: "Status" },
];

/** Shimmer cells for one `SharedDocumentListItem`, kept beside the columns so the two stay in step. */
export const sharedDocumentSkeletonRow = (
  <>
    <div className="flex min-w-0 items-center gap-3 sm:col-span-5">
      <div className="skeleton size-10 shrink-0 rounded-field" />
      <div className="skeleton h-4 w-2/3 rounded-field" />
    </div>

    <div className="sm:col-span-3">
      <div className="skeleton h-4 w-28 rounded-field" />
    </div>

    <div className="sm:col-span-2">
      <div className="skeleton h-4 w-24 rounded-field" />
    </div>

    <div className="flex justify-end sm:col-span-2">
      <div className="skeleton h-6 w-16 rounded-field" />
    </div>
  </>
);

/** Documents shared with the user, or an empty state when there are none. */
export const SharedDocumentList = ({
  documents,
  onOpen,
  userEmail,
}: SharedDocumentListProps) => {
  if (documents.length === 0) {
    return (
      <div className="grid min-h-72 w-full place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-12 text-center">
        <p className="font-title text-base font-bold text-nox-noir">
          Nothing shared with you yet
        </p>
        <p className="mt-1 max-w-sm text-sm text-nox-noir/60">
          Documents other people share with you appear here once you sign in
          with the email address they used.
        </p>
      </div>
    );
  }

  return (
    <DashboardList
      columns={sharedDocumentListColumns}
      ordered
    >
      {documents.map((document) => (
        <SharedDocumentListItem
          document={document}
          key={document.id}
          onOpen={onOpen}
          status={recipientStatusFor(document, userEmail)}
        />
      ))}
    </DashboardList>
  );
};
