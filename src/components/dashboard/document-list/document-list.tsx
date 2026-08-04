import { DocumentListItem } from "@/components/dashboard/document-list-item/document-list-item";
import type { UserDocument } from "@/types/template";

export interface DocumentListProps {
  documents: UserDocument[];
  onEdit: (document: UserDocument) => void;
  onPreview: (document: UserDocument) => void;
  onPrint: (document: UserDocument) => void;
}

export const DocumentList = ({ documents, onEdit, onPreview, onPrint }: DocumentListProps) => {
  return (
    <div className="document-list overflow-hidden rounded-box border border-steel-mist bg-base-100">
      <div className="hidden grid-cols-12 items-center px-5 py-3 sm:grid">
        <span className="col-span-5 font-title text-xs font-bold uppercase tracking-wide text-nox-noir/45">
          Title
        </span>
        <span className="col-span-2 font-title text-xs font-bold uppercase tracking-wide text-nox-noir/45">
          Type
        </span>
        <span className="col-span-3 font-title text-xs font-bold uppercase tracking-wide text-nox-noir/45">
          Date created
        </span>
        <span className="col-span-2 text-right font-title text-xs font-bold uppercase tracking-wide text-nox-noir/45">
          Actions
        </span>
      </div>

      <ol>
        {documents.map((document) => (
          <DocumentListItem
            document={document}
            key={document.id}
            onEdit={onEdit}
            onPreview={onPreview}
            onPrint={onPrint}
          />
        ))}
      </ol>
    </div>
  );
};
