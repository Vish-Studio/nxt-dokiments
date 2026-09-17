import {
  FileTextIcon,
  PencilSimpleIcon,
  PrinterIcon,
} from "@phosphor-icons/react";

import { Badge } from "@/components/commons/badge/badge";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { DashboardListRow } from "@/components/dashboard/dashboard-list-row/dashboard-list-row";
import type { UserDocument } from "@/types/template";

export interface DocumentListItemProps {
  document: UserDocument;
  onEdit: (document: UserDocument) => void;
  onPreview: (document: UserDocument) => void;
  onPrint: (document: UserDocument) => void;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const formatDocumentType = (value: string) =>
  value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const DocumentListItem = ({
  document,
  onEdit,
  onPreview,
  onPrint,
}: DocumentListItemProps) => {
  const snapshot = document.templateSnapshot;
  const documentType = snapshot
    ? formatDocumentType(snapshot.documentType)
    : "Document";
  const documentTitle = document.values.title?.trim() || document.name;
  const createdDate = new Date(document.createdAt);

  return (
    <DashboardListRow
      className="document-list-item"
      onSelect={() => onPreview(document)}
      selectLabel={`Open preview for ${documentTitle}`}
    >
      <div className="pointer-events-none relative z-10 flex min-w-0 items-center gap-3 sm:col-span-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-field bg-play-purple text-nox-noir">
          <FileTextIcon
            aria-hidden
            size={20}
            weight="bold"
          />
        </span>
        <div className="min-w-0">
          <p className="truncate font-title text-sm font-bold text-nox-noir sm:text-base">
            {documentTitle}
          </p>
          <p className="mt-0.5 truncate text-xs text-nox-noir/50">
            {snapshot?.style.name ?? "Template unavailable"}
          </p>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 sm:col-span-2">
        <span className="mb-1 block font-title text-xs font-semibold text-nox-noir/45 sm:hidden">
          Type
        </span>
        <Badge>{documentType}</Badge>
      </div>

      <div className="pointer-events-none relative z-10 sm:col-span-3">
        <span className="mb-1 block font-title text-xs font-semibold text-nox-noir/45 sm:hidden">
          Created
        </span>
        <time
          className="text-sm text-nox-noir/65"
          dateTime={createdDate.toISOString()}
        >
          {dateFormatter.format(createdDate)}
        </time>
      </div>

      <div className="relative z-20 flex items-center justify-end gap-2 sm:col-span-2 sm:justify-self-end">
        <ButtonIcon
          aria-label={`Print ${documentTitle}`}
          icon={
            <PrinterIcon
              aria-hidden
              size={17}
              weight="bold"
            />
          }
          onClick={() => onPrint(document)}
          shape="square"
          size="sm"
          variant="outline"
        />
        <ButtonIcon
          aria-label={`Edit ${documentTitle}`}
          icon={
            <PencilSimpleIcon
              aria-hidden
              size={18}
              weight="bold"
            />
          }
          onClick={() => onEdit(document)}
          shape="square"
          size="sm"
          variant="primary"
        />
      </div>
    </DashboardListRow>
  );
};
